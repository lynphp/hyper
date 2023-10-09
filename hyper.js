
let _pages=[];
console.log('loaded')
const hyper =((directive='hyper')=>{
    const selector = '*['+directive +']'
    const pending=[]
    const pages=_pages
    const _fetch='fetch'
    const _id = 'id'
    const _listen = 'listen'
    const _trigger = 'trigger'
    const _prepare = 'prepare'
    const _static = 'static'
    const _replace = 'replace'
    const _fill = 'fill'
    const _self = 'self'
    const _uid = 'self'
    const _href = 'href'
    const _action = 'action'
    const _bind = 'bind'
    const _method = 'method'
    var uid = function(i) {
        return function () {
            return _uid + (++i)
        };
    }(0);

    function setHID(element){
        let hid = ''
        if (!element.hasAttribute(_id)) {
            hid = uid();
            element.setAttribute(_id,hid)
        }
        return hid;
    }

    function getURL(element){
        let params= getDataAttribute(element)
        if(element.hasAttribute(_fetch)){
            return element.getAttribute(_fetch).split(":")[1]+'?'+params
        }else if(element.nodeName === 'A'){
            if(element.hasAttribute(_href) && element.getAttribute(_href).startsWith('javascript')){
                eval(element.getAttribute(_href))
                return  undefined
            }if(element.hasAttribute('_href') && element.getAttribute('_href')){
                return element.getAttribute('_href')+'?'+params;
            }
            return element.getAttribute(_href)+'?'+params;
        }else if(element.nodeName==='FORM' && element.hasAttribute(_action)){
            return element.getAttribute(_action)
        }
    }

    function getDataAttribute(element){
        const queryParams = {}
        Object.getOwnPropertyNames(element.dataset).forEach((prop)=>{
            if(element.dataset[prop].startsWith(_bind)){
                queryParams[prop] = document.querySelector(element.dataset[prop].split(':')[1])?.value
            }else{
                queryParams[prop] = element.dataset[prop]
            }
        });
        return (new URLSearchParams(queryParams)).toString()
    }

    function get(element) {
        let url = getURL(element)
        if(url !== undefined) {

            if (element.hasAttribute(_static) && pages[url] !== undefined) {
                return pages[url];
            }
            function getAndWait(url) {
                const getRequest= new Request(url, {
                    method: "GET",
                    mode: "no-cors",
                    headers: {'Accept': 'text/html'}
                });
                return fetch(getRequest).then(function (response) {
                    let html= response.text();
                    return html
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err)
                    return ''
                });
            }

            let response = getAndWait(url)
            if (element.hasAttribute(_static) && pages[url] === undefined) {
                pages[url] = response;
            }

            return response;
        } else {
            return '';
        }
    }

    function post(element){
        let url = getURL(element)
        if(url !== undefined) {
            if (element.hasAttribute(_static) && pages[url] !== undefined) {
                return pages[url]
            }
            function postAndWait(data) {
                const getRequest= new Request(url, {
                    method: "POST",
                    mode: "cors",
                    headers: {'Accept': 'text/html'},
                });
                return fetch(getRequest).then(function (response) {
                    return response.text();
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err)
                });
            }
            let response= postAndWait()
            if (element.hasAttribute(_static) && pages[url] === undefined) {
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
            if(element.dataset[prop].startsWith(_bind)){
                queryParams[prop] = document.querySelector(element.dataset[prop].split(':')[1])?.value
            }else{
                queryParams[prop] = element.dataset[prop]
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
        if(element.getAttribute(_replace) !== _self){
            element.replaceWith(content);
        }else{
            document.querySelector(element.getAttribute(_replace)).replace(content);
            initElementIDs();
            handle(document.querySelector(element.getAttribute(_replace)))
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

        if (element.getAttribute(_fill) !== _self) {
            document.querySelector(element.getAttribute(_fill)).innerHTML = content;
            initElementIDs();
            handleChunk(document.querySelector(element.getAttribute(_fill)).innerHTML);
        } else {
            element.innerHTML = content
            initElementIDs();
            handleChunk(element.innerHTML);
        }
    }

    function populate(content, element){
        if(element.hasAttribute('extract')){
            let dom= new DOMParser().parseFromString(content, 'text/html')
            content = dom.querySelector(element.getAttribute('extract')).innerHTML
        }
        if(element.nodeName === 'A') {
            if(element.hasAttribute(_fill)){
                fill(content, element)
            }
        }else if(element.hasAttribute(_replace)){
            replace(content, element)
        }else if(element.hasAttribute(_fill)) {
            fill(content, element)
        }else {
            element.innerHTML = content
            initElementIDs()
            handleChunk(element.innerHTML);
        }

    }

    async function executeFetch(element){
        let response = await fetchContent(element)
        populate(response, element)
    }

    async function fetchContent(element){
        if(element.getAttribute(_fetch)?.startsWith('GET')){
            return get(element)
        }
        if(element.getAttribute(_fetch)?.startsWith('POST')){
            return  post(element)
        }
        return get(element)
    }

    function debounce(func, timeout = 300){
        let timer
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    async function submitForm(element){
        let url = getURL(element)
        let data= {}
        if(url !== undefined) {
            if (element.hasAttribute(_static) && pages[url] !== undefined) {
                return pages[url]
            }
            async function postAndWait(data) {
                const getRequest= new Request(url, {
                    method: element.getAttribute(_method),
                    mode: "cors",
                    headers: {'Accept': 'text/html'},
                    body: data,
                });
                return fetch(getRequest).then(function  (response) {
                    return response.text();
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err)
                });
            }
            if(element.nodeName==='FORM'){
                data = new FormData(element)
            }
            let response= await postAndWait(data)
            if (element.hasAttribute(_static) && pages[url] === undefined) {
                pages[url] = response
            }
            populate(response,element)
        } else {
            return ''
        }
    }
    function prepare(element){
        get(element);

    }

    function loadJs(element) {
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
        _pages=pages
        hyper();
        document.evaluate("html//head//script",
            document,
            null,
            XPathResult.ANY_TYPE,
            null
        )
    }
    async function handle(element){
        if(!element.hasAttribute(directive)){
            return;
        }
        setHID(element)

        if (element.hasAttribute(_listen)) {
            let listenParts= element.getAttribute(_listen).toLowerCase().split(':')
            let elem = document.querySelector(listenParts[0])
            elem.addEventListener(listenParts[1], ()=>{
                 executeFetch(element)
            })
        } else if (element.hasAttribute(_trigger)) {
            let on= element.getAttribute(_trigger).toLowerCase().split('|')
            on.forEach((event) => {
                if ( event === 'load') {
                     executeFetch(element)
                } else{
                    if ('on' + event in element) {
                        element.addEventListener(event,async (e)=>{await executeFetch(element)})
                    }else{
                        console.log(event.split(':')[0])
                        document.querySelector(event.split(':')[0]).addEventListener(event.split(':')[1],()=>{
                            executeFetch(element)
                        })
                    }
                }
            })
        } else if (element.hasAttribute(_prepare)) {
            if(pages[getURL(element)]===undefined) {
                pages[getURL(element)] = await fetchContent(element)
            }
            element.style.cursor='pointer'
            element.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.history.replaceState) {
                    replacePage(pages[getURL(element)])
                    //prevents browser from storing history with each change:
                    window.history.replaceState(null, document.title, getURL(element));
                }
            })
            let url = element.getAttribute('href');
            element.removeAttribute('href')
            element.setAttribute('_href',url);
        } else if (element.hasAttribute(_static)) {
            executeFetch(element)
        } else if (element.hasAttribute('action')) {
            element.addEventListener('submit',(event)=>{
                event.preventDefault()
                submitForm(event.target)
            })
        }
    }

    document.querySelectorAll(selector).forEach((element)=> {
       handle(element);
    });
});
hyper()