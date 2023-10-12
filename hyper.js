/**
* Hyper is a rich client libray for 
* hypermedia handling and manipulation
* Written by Resti Guay
* Copywrite 2023
*/
let _pages=[];
let mode = 'dev'
window.hyper = ((directive='hyper')=>{
    let selector = '*['+directive +']'
    let pending=[];
    let pages=_pages
    let _fetch='fetch'
    let _id = 'id'
    let _listen = 'listen'
    let _trigger = 'trigger'
    let _every ='every'
    let _prepare = 'prepare'
    let _static = 'static'
    let _replace = 'replace'
    let _fill = 'fill'
    let _self = 'self'
    let _uid = 'self'
    let _href = 'href'
    let _action = 'action'
    let _bind = 'bind'
    let _method = 'method'
    let _header = 'x-request'
    let _spread = 'spread'
    let _extract = 'extract'
    let _contentType = 'text/html'
    let _disableBack = 'disable-back'
    let _htmln = 'htmln'
    let _elems = [];
    Object.prototype.hasProp=function(attr){
        return this.hasOwnProperty(attr)
    }
    Object.prototype.getAttr=function(attr){
        return this[attr]
    }
    HTMLElement.prototype.hasAttr=function(attr){
        return _elems[this.id].hasProp(attr)
    }
    HTMLElement.prototype.getAttr=function(attr){
        return _elems[this.id].getAttr(attr)
    }
    let hyprAttr= {
        _spread : 'spread',
        _extract : 'extract',
        _htmln : 'htmln',
        _trigger : 'trigger',
        _prepare : 'prepare',
        _static : 'static',
        _replace : 'replace',
        _fetch : 'fetch',
        _directive:directive
    }
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
            }
            if(element.hasAttribute('_href') && element.getAttribute('_href')){
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
            } else {
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
                    headers: {'Accept': _contentType, 'Hyper':'true'}
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
            if (element.hasAttr(_static) && pages[url] !== undefined) {
                return pages[url]
            }
            function postAndWait(data) {
                const getRequest= new Request(url, {
                    method: "POST",
                    mode: "cors",
                    headers: {'Accept': _contentType, _header:directive},
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
    /**
     * Replace the who element with response from server
     * @param content
     * @param element
     */
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
        let doc = new DOMParser().parseFromString(html,_contentType)
        doc.querySelectorAll('*[id]').forEach(async(elem)=>{
            await handle(document.getElementById(elem.id))
        })
    }
    /**
     * insert response into element's innerHTML
     * @param content
     * @param element
     */
    function fill(content, element){
        if (element.getAttribute(_fill) !== _self) {
            if(document.querySelector(element.getAttribute(_fill))) {
                document.querySelector(element.getAttribute(_fill)).innerHTML = content;
                initElementIDs();
                handleChunk(document.querySelector(element.getAttribute(_fill)).innerHTML);
            }
        } else {
            element.innerHTML = content
            initElementIDs();
            handleChunk(element.innerHTML);
        }
    }
    /**
     * replac="#target-element"
     * fill="#target-element"
     * extract="#content-element" requires fill or replace attribute
     * spread="#content-element-id1:fill=#target-element1|#content-element-id2:replace=#target-element2|n..."
     * @param content HTMLElement
     * @param element String
     */
    function populate(content, element){
        if(element.hasAttribute(_extract)){
            let dom= new DOMParser().parseFromString(content, _contentType)
            content = dom.querySelector(element.getAttribute(_extract)).innerHTML
        } else if (element.hasAttribute(_spread)){
            //spread="#content-element-id:fill=#target-element|n..."
            let dom= new DOMParser().parseFromString(content, _contentType)
            let targets = element.getAttribute(_spread).split('|')
            targets.forEach((target)=>{
                let resContent = dom.querySelector(target.split(':')[0]).innerHTML
                let operTarget = target.split(':')[1].split('=')
                let tmpElem = document.createElement('div')
                tmpElem.setAttribute(operTarget[0],operTarget[1])
                populate(resContent, tmpElem)
            })
            return
        } else if (element.hasAttribute(_htmln)) {
            let dom= new DOMParser().parseFromString(content, _contentType)
            dom.querySelectorAll('*[id]').forEach((elm)=>{
                let elem = document.getElementById(elm.id)
                if(isHTML(elm.innerHTML)) {
                    elem.innerHTML = elm.innerHTML
                }else{
                    elem.innerText = elm.innerText
                }
            })
            return
        }
        if(element.nodeName === 'A') {
            if (element.hasAttribute(_fill)) {
                fill(content, element)
            }
        }else if(element.hasAttribute(_replace)){
            replace(content, element)
        }else if(element.hasAttr(_fill)) {
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

    function isHTML(content){
        let elem = document.createElement('div');
        elem.innerHTML = content;
        return elem.children.length > 0;
    }

    async function fetchContent(element){
        if(element.getAttribute(_fetch)?.startsWith('GET')){
            return get(element)
        }
        if(element.getAttribute(_fetch)?.startsWith('POST')){
            return  post(element)
        }
        if(element.getAttribute(_fetch)?.startsWith('DELETE')){
            return  post(element)
        }
        if(element.getAttribute(_fetch)?.startsWith('PUT')){
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
            if (element.hasAttr(_static) && pages[url] !== undefined) {
                return pages[url]
            }
            async function postAndWait(data) {
                const getRequest= new Request(url, {
                    method: element.getAttribute(_method),
                    mode: "cors",
                    headers: {'Accept': _contentType, _header:directive},
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
        window.hyper();
        document.evaluate("html//head//script",
            document,
            null,
            XPathResult.ANY_TYPE,
            null
        )
    }
    function register(element){
        _elems[element.id]={};
        for (let hyprAttrKey in hyprAttr) {
            let attr = hyprAttr[hyprAttrKey]
            if(element.hasAttribute(attr)){
                _elems[element.id][attr]=element.getAttribute(attr)
                if(mode !== 'dev'){
                    element.removeAttribute(attr)
                }
            }
        }
    }
    async function handle(element){
        if(!element.hasAttribute(directive)){
            return;
        }
        setHID(element)
        register(element)
        if (element.hasAttr(_listen)) {
            let listenParts= element.getAttribute(_listen).toLowerCase().split(':')
            let elem = document.querySelector(listenParts[0])
            elem.addEventListener(listenParts[1], ()=>{
                 executeFetch(element)
            })
        } else if (element.hasAttr(_trigger)) {
            let on= element.getAttr(_trigger).toLowerCase().split('|')
            on.forEach( (event) => {
                if ( event === 'load') {
                     executeFetch(element)
                } else if ('on' + event in element) {
                    element.addEventListener(event,async (e)=>{await executeFetch(element)})
                }
                if (event.startsWith(_every)) {
                   setInterval(async ()=>{await executeFetch(element)}, parseInt(event.split(':')[1]))
                } else {
                    //listeners
                    if(event.lastIndexOf(':')>0) {
                        document.querySelector(event.split(':')[0]).addEventListener(event.split(':')[1], () => {
                            executeFetch(element)
                        })
                    }
                }
            })
        } else if (element.hasAttr(_prepare)) {
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
            let url = element.getAttribute(_href);
            element.removeAttribute(_href)
            element.setAttribute(_href,url)
        } else if (element.hasAttr(_static)) {
            executeFetch(element)
        } else if (element.hasAttr(_action)) {
            element.addEventListener(_submit,(event)=>{
                event.preventDefault()
                submitForm(event.target)
            })
        }
        if(element.nodeName === 'BUTTON' && !element.hasAttr(_trigger)) {
            element.addEventListener('click', () => {
                executeFetch(element)
            })
        }
        if(element.hasAttr('back-button')){
            window.history.forward();
            function noBack() {
                window.history.forward();
            }
        }
    }

    document.querySelectorAll(selector).forEach((element)=> {
       handle(element);
    });
});
window.addEventListener('load',window.hyper())


