
let pages=[];
const hyper = ()=>{
    let pending=[];
    const hyperAttrs=['fetch','replace','fill','lazy','every','as', 'on'];
    const elemBehave=[]
    var uid = function (i) {
        return function () {
            return 'uid-' + (++i);
        };
    }(0);
    
    function hasEvent(callback){
        return typeof callback === 'function';
    }
    function handleButton(element){
        if(hasEvent(element.onclick)){
            console.log('with click event')
        }else{
            element.addEventListener('click', executeWith(element))
            console.log('no click event')
        }
    }
    function handleSelect(elem){

    }
    function onclick(event){
        if(!event.target.hasAttribute('fetch') && !event.target.hasAttribute('href')){
            alert('HER001: Attribute "with" was not set for ' + event.target.nodeName.toLowerCase()+"#"+event.target.id);
        }
        executeWith(event.target).then(r => '');
    }
    async function fetchContent(element){
        if(element.getAttribute('fetch')?.startsWith('GET')){
            return await get(element);
        }
        if(element.getAttribute('fetch')?.startsWith('POST')){
            return  await post(element);
        }
        return await get(element);
    }
    async function executeWith(element){
        if(element.hasAttribute('on')){
            element.removeEventListener(element.hasAttribute('on'));
        }
        populate(await fetchContent(element),element);
        hyper();
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
    function getURL(element){
        if(element.hasAttribute('fetch')){
            return element.getAttribute('fetch').split(":")[1]
        }else if(element.nodeName.toLowerCase()==='a'){
            return element.getAttribute('href');
        }
    }
    async function get(element) {
        let url = getURL(element)
        if(element.hasAttribute('static') && pages[url]!==undefined){
            return pages[url];
        }
        async function getAndWait() {
            const getRequest = new Request(url + "?" +getDataAttribute(element), {
                method: "GET",
                mode: "cors",
                headers:{'Accept':'text/html'}
            });
            return await fetch(getRequest).then(function(response) {
                // When the page is loaded convert it to text
                return response.text();
            }).catch(function(err) {
                console.log('Failed to fetch page: ', err);
            });
        }
        let response = await getAndWait();
        if(element.hasAttribute('static') && pages[url]===undefined){
             pages[url]=response;
        }
        return response;
    }
    async function post(element){
        let url = getURL(element)
        if(element.hasAttribute('static') && pages[url]!==undefined){
            return pages[url];
        }
        async function postAndWait() {
            const getRequest = new Request(url, {
                method: "POST",
                mode: "cors",
                headers:{'Accept':'text/html'}
            });
            return await fetch(getRequest).then(function(response) {
                // When the page is loaded convert it to text
                return response.text();
            }).catch(function(err) {
                console.log('Failed to fetch page: ', err);
            });
        }
        let response = await postAndWait();
        if(element.hasAttribute('static') && pages[url]===undefined){
            pages[url]=response;
        }
        return await postAndWait();
    }
    function handleDiv(element){
        if(!element.hasAttribute('hyper-state')){
            executeWith(element).then(()=>{
                element.setAttribute('hyper-state','completed')
                }
            )
        }
    }
    function checkVisible(element) {
        var rect = element.getBoundingClientRect();
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }

    /**
     *
     * @param element HTMLFormElement
     */
    function handleForm(element) {
        element.addEventListener('submit',(e)=>{
            if(element.hasAttribute('default') && element.getAttribute('default')==='false'){
                e.preventDefault();
            }
        })
    }
    async function handleA(element) {
        element.addEventListener('click', async (e) => {
            e.preventDefault();
            let content = await fetchContent(element);
            if (window.history.replaceState && element.hasAttribute('fill') && element.getAttribute('fill') === 'page') {
                replacePage(content)
                //prevents browser from storing history with each change:
                window.history.replaceState(null, document.title, element.href);
            } else {
                populate(content, element)
                hyper();
            }
        })
    }
    function populate(content, element){
        if(element.hasAttribute('replace')){
            if(element.getAttribute('replace')!=='self'){
                let elem = document.querySelector(element.getAttribute('replace'))
                elem.replaceWith(content);
            }else{
                element.replaceWith(content);
            }
        }else if(element.hasAttribute('fill')){
            let target = element.getAttribute('fill');
            let elem = document.querySelector(target)
            if(elem === null) {
                let elemSelect = element.getAttribute('fill')
                console.error("HER002:  %s was not found!",elemSelect)
                return;
            }
            elem.innerHTML=content;
        }else{
            element.innerHTML=content;
        }
    }
    function loadJs(element)
    {
        let src= element.src;
        let head= document.getElementsByTagName('head')[0];
        let script= document.createElement('script');
        script.src= src;
        script.setAttribute('crossOrigin', 'crossOrigin')
        script.setAttribute('type', 'module')
        element.parentElement.removeChild(element);
        head.appendChild(script);
    }
    function replacePage(content) {
        let doc = new DOMParser().parseFromString(content, 'text/html')
        document.querySelector("body").innerHTML=doc.body.innerHTML
        document.querySelector("title").innerText=doc.title
        const scripts = document.getElementsByTagName('script');
        for (let ix = 0; ix < scripts.length; ix++) {
            loadJs(scripts[ix]);
        }
        hyper();
        document.evaluate("html//head//script",
            document,
            null,
            XPathResult.ANY_TYPE,
            null)
    }
    function removePending(element) {

        pending = pending.filter(function (elem) {
            return elem !== element;
        });

    }
    function debounce(func, timeout = 300){
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
    function handle(element){
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
                            break;
                        case 'load':
                            window.addEventListener('load',()=>executeWith(element))
                            break;
                        case 'mouseover':
                            window.addEventListener('mouseover',()=>executeWith(element))
                            break;
                    }
                })

            }else if(element.hasAttribute('listen')){
                let elem = document.querySelector(element.getAttribute('listen').toLowerCase().split(':')[0]);
                elem.onchange=()=>executeWith(element)
            }
            if(element.hasAttribute('prepare')) {
                element.addEventListener(element.getAttribute('prepare'), debounce(async () => {
                    if(pending[element]===undefined) {
                        pending[element]=true;
                        pages[getURL(element)] = await fetchContent(element);
                        let dom = new DOMParser().parseFromString(pages[getURL(element)], 'text/html')
                        let elements = dom.querySelectorAll('*[hyper]')
                        elements.forEach((element)=> {
                            handle(element);
                        });
                        removePending(element);
                    }
                }));
            }
        });
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
                break;
            case 'form':
                handleForm(element)
                break;
            case 'a':
                handleA(element)
                break;
        }
    }
    let elements = document.querySelectorAll('*[hyper]')

    elements.forEach((element)=> {
        handle(element);
    });
}
hyper();
