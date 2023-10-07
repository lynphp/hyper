const hyper =((directive='hyper')=>{
    const selector = '*['+directive +']';
    const pending=[];
    const pages=[];
    var uid = function(i) {
        return function () {
            return 'uid' + (++i)
        };
    }(0);

    function setHID(element){
        let hid = '';
        if (!element.hasAttribute('id')) {
            hid = uid();
            element.setAttribute('id',hid)
        }
        return hid;
    }

    function getURL(element){
        let params=getDataAttribute(element);
        if(element.hasAttribute('fetch')){
            return element.getAttribute('fetch').split(":")[1]+'?'+params
        }else if(element.nodeName.toLowerCase()==='a'){
            if(element.getAttribute('href').startsWith('javascript')){
                return  undefined;
            }
            return element.getAttribute('href')+'?'+params;
        }
    }

    function getDataAttribute(element){
        const queryParams = {}
        Object.getOwnPropertyNames(element.dataset).forEach((prop)=>{
            if(element.dataset[prop].startsWith("bind")){
                queryParams[prop]=document.querySelector(element.dataset[prop].split(':')[1])?.value
            }else{
                queryParams[prop]=element.dataset[prop]
            }
        });
        return (new URLSearchParams(queryParams)).toString();
    }
    function get(element) {
        let url = getURL(element)
        if(url!==undefined) {
            if (element.hasAttribute('static') && pages[url] !== undefined) {
                return pages[url];
            }
            function getAndWait(url) {
                const getRequest = new Request(url, {
                    method: "GET",
                    mode: "cors",
                    headers: {'Accept': 'text/html'}
                });
                return fetch(getRequest).then(function (response) {

                    let html = response.text();
                    return html;
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err);
                    return '';
                });
            }
            let response = getAndWait(url);
            if (element.hasAttribute('static') && pages[url] === undefined) {
                pages[url] = response;
            }
            return response;
        } else {
            return '';
        }
    }

    function post(element){
        let url = getURL(element)
        if(url!==undefined) {
            if (element.hasAttribute('static') && pages[url] !== undefined) {
                return pages[url];
            }

            function postAndWait() {
                const getRequest = new Request(url, {
                    method: "POST",
                    mode: "cors",
                    headers: {'Accept': 'text/html'}
                });
                return fetch(getRequest).then(function (response) {
                    return response.text();
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err);
                });
            }

            let response = postAndWait();
            if (element.hasAttribute('static') && pages[url] === undefined) {
                pages[url] = response;
            }
            return response;
        }else{
            return '';
        }
    }

    function getDataAttribute(element){
        const queryParams = {}
        Object.getOwnPropertyNames(element.dataset).forEach((prop)=>{
            if(element.dataset[prop].startsWith("bind")){
                queryParams[prop]=document.querySelector(element.dataset[prop].split(':')[1])?.value
            }else{
                queryParams[prop]=element.dataset[prop]
            }
        });
        return (new URLSearchParams(queryParams)).toString();
    }

    function removePending(element) {
        pending = pending.filter(function (elem) {
            return elem !== element;
        });
    }

    function replace(content, element){
        if(element.getAttribute('replace')!=='self'){
            element.replaceWith(content);
        }else{
            document.querySelector(element.getAttribute('replace')).replace(content);
            initElementIDs();
            handle(document.querySelector(element.getAttribute('replace')))
        }
    }
    function initElementIDs(){
        document.querySelectorAll(selector).forEach((elem)=>{
            setHID(elem)
        })
    }
    function handleChunk(html){
        let doc = new DOMParser().parseFromString(html,'text/html')
        doc.querySelectorAll('*[id]').forEach(async(elem)=>{
            await handle(document.getElementById(elem.id))
        })
    }
    function fill(content, element){

        if (element.getAttribute('fill') !== 'self') {
            document.querySelector(document.querySelector(element.getAttribute('fill'))).innerHTML = content;
            initElementIDs();
            handleChunk(document.querySelector(document.querySelector(element.getAttribute('fill'))).innerHTML);
        } else {
            element.innerHTML = content
            initElementIDs();
            handleChunk(element.innerHTML);
        }
    }
    function populate(content, element){
        if(element.nodeName==='A') {
            if(element.hasAttribute('fill')){
                fill(content, element)
            }
        }else if(element.hasAttribute('replace')){
            replace(content, element)
        }else if(element.hasAttribute('fill')) {
            fill(content, element)
        }else {
            element.innerHTML = content
            initElementIDs();
            handleChunk(element.innerHTML);
        }

    }

    async function executeFetch(element){
        let response = await fetchContent(element)
        populate(response, element)
    }
    function getHID(element){
        return element.getAttribute('hid')
    }
    async function fetchContent(element){
        if(element.getAttribute('fetch')?.startsWith('GET')){
            return get(element);
        }
        if(element.getAttribute('fetch')?.startsWith('POST')){
            return  post(element);
        }
        return get(element);
    }

    function debounce(func, timeout = 300){
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }
    async function handle(element){
        setHID(element)
        if(element.hasAttribute('listen')){
            let listenParts= element.getAttribute('listen').toLowerCase().split(':');
            let elem = document.querySelector(listenParts[0]);
            elem.addEventListener(listenParts[1], ()=>{
                 executeFetch(element)
            })
        }else if(element.hasAttribute('trigger')){
            let on = element.getAttribute('trigger').toLowerCase().split(',');
            on.forEach((event) =>{
                if( event ==='load'){
                     executeFetch(element)
                } else if ('on' + event in element){
                    element.addEventListener(event,async (e)=>{await executeFetch(element)})
                }
            })
        }else if(element.hasAttribute('prepare')) {
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
        }else if(element.hasAttribute('static')){
            executeFetch(element)
        }
    }
    document.querySelectorAll(selector).forEach((element)=> {
       handle(element);
    });
});
hyper()