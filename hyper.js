(()=>{
    const hyperAttrs=['with','replace','fill','lazy','every','as', 'on'];
    const elemBehave=[]
    var uid = function (i) {
        return function () {
            return 'uid-' + (++i);
        };
    }(0);
    
    function hasEvent(callback){
        return typeof callback === 'function';
    }
    function handleButton(elem){
        if(hasEvent(elem.onclick)){
            console.log('with click event')
        }else{
            console.log('no click event')
        }
    }
    function handleSelect(elem){

    }
    function onclick(event){
        if(!event.target.hasAttribute('with')){
            alert('HER001: Attribute "with" was not set for ' + event.target.nodeName.toLowerCase()+"#"+event.target.id);
        }
        executeWith(event.target).then(r => '');
    }
    async function executeWith(element){
        let response='';
        if(element.getAttribute('with').startsWith('GET')){
            response = await get(element);
        }
        if(element.getAttribute('with').startsWith('POST')){
            response = await post(element);
        }

        if(element.hasAttribute('replace')){
            if(element.getAttribute('replace')!=='self'){
                let elem = document.querySelector(element.getAttribute('replace'))
                elem.replaceWith(response);
            }else{
                element.replaceWith(response);
            }
        }else if(element.hasAttribute('fill')){
            let elem = document.querySelector(element.getAttribute('fill'))
            if(elem===null) {
                let elemSelect = element.getAttribute('fill')
                console.error("HER002:  %s was not found!",elemSelect)
                return;
            }
            elem.innerHTML=response;
        }else{
            element.innerHTML=response;
        }
    }
    function getDataAttribute(element){
        const queryParams = {}
        Object.getOwnPropertyNames(element.dataset).forEach((prop)=>{
            if(element.dataset[prop].startsWith("bind")){
                queryParams[prop]=document.querySelector(element.dataset[prop].split(':')[1])?.value
            }
        });
        return (new URLSearchParams(queryParams)).toString();
    }
    async function get(element) {
        let url = element.getAttribute('with').split(":")[1]
        console.log(url + "?" +getDataAttribute(element))
        async function getAndWait() {
            const getRequest = new Request(url + "?" +getDataAttribute(element), {
                method: "GET",
                mode: "cors",
            });
            return await fetch(getRequest).then(function(response) {
                // When the page is loaded convert it to text
                return response.text();
            }).catch(function(err) {
                console.log('Failed to fetch page: ', err);
            });;
        }
        return await getAndWait();
    }
    async function post(element){

        let url = element.getAttribute('with').split(":")[1]

        async function postAndWait() {
            const getRequest = new Request(url, {
                method: "POST",
                mode: "cors",
            });
            return await fetch(getRequest).then(function(response) {
                // When the page is loaded convert it to text
                return response.text();
            }).catch(function(err) {
                console.log('Failed to fetch page: ', err);
            });;
        }
        return await postAndWait();
    }
    function handleDiv(element){

    }
    function checkVisible(element) {
        var rect = element.getBoundingClientRect();
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }
    function hyper(element){
        let type = element.nodeName.toLowerCase();
        hyperAttrs.forEach((attr)=>{
            if(!element.hasAttribute('id')){
                element.setAttribute('id',uid())
            }
            if(element.hasAttribute('on')){
                let on = element.getAttribute('on').toLowerCase().split('|');
                on.forEach((event)=>{
                    switch (event){
                        case 'click':
                            element.onclick=(e)=>onclick(e);
                    }
                })

            }else if(element.hasAttribute('listen')){
                let elem = document.querySelector(element.getAttribute('listen').toLowerCase().split(':')[0]);
                elem.onchange=()=>{executeWith(element)};
            }else{
                executeWith(element);
            }
        })
        switch (type){
            case 'button':
                handleButton(element)
                break
            case 'select':
                handleSelect(element)
                break
            case 'input':
                handleButton(element)
                break
            case 'div':
                handleDiv(element)
        }
    }
    let elements = document.querySelectorAll('*[hyper]')

    elements.forEach((element)=> {
        hyper(element);
    });
})()
