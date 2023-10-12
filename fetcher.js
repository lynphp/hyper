
window.fetcher={
    name: 'fetcher',
    _fetch: 'fetcher-fetch',
    _trigger: 'fetcher-trigger',
    _fill: 'fetcher-fill',
    _replace: 'fetcher-replace',
    _bind : 'bind',
    _href: 'href',
    _action: 'action',
    _startProgress:(frgmnt)=>{},
    _endProgress:(frgmnt)=>{},
    pages:[],
    _contentType:'text/html',
    init:()=>{},
    handle:async (frgmnt)=>{
        if(frgmnt.hasAttribute(fetcher._trigger)) {
            if (frgmnt.getAttribute(fetcher._trigger) === 'load') {
                fetcher.do(await fetcher.fetch(frgmnt), frgmnt)
            } else if (frgmnt.getAttribute(fetcher._trigger) === 'click') {
                frgmnt.addEventListener('click', async () => {
                    fetcher.do(fetcher.fetch(frgmnt), frgmnt)
                })
            }
        }else if (frgmnt.nodeName==='BUTTON'){
            frgmnt.addEventListener('click', async () => {
                fetcher.do(await fetcher.fetch(frgmnt), frgmnt)
            })
        }else{
            fetcher.do(await fetcher.fetch(frgmnt),frgmnt)
        }
    },
    isHTML:(content)=>{
        let elem = document.createElement('div');
        elem.innerHTML = content;
        return elem.children.length > 0;
    },
    do:(content, frgmnt)=>{
        let doc = new DOMParser().parseFromString(content, 'text/html')
        if(frgmnt.hasAttribute(fetcher._fill)) {
            let elem = document.querySelector(frgmnt.getAttribute(fetcher._fill))
            if (elem !== undefined) {
                if (doc.body.getElementById(frgmnt.id) !== undefined) {
                    frgmnt.replaceWith(doc.body.getElementById(frgmnt.id))
                } else if (this.isHTML(content)) {
                    elem.innerHTML = doc.body.innerHTML
                } else {
                    frgmnt.replaceWith(content)
                }
            } else if (window.env === 'dev') {
                alert(frgmnt.getAttribute(this._fill) + " element does not exist")
            }
        }else if(doc.body.querySelectorAll('*[id]').length>0){
            doc.body.querySelectorAll('*[id]').forEach((elem)=>{
                if(document.getElementById(elem.id)!==null){
                    if(document.getElementById(elem.id).nodeName===elem.nodeName){
                        document.getElementById(elem.id).innerHTML=elem.innerHTML
                    }
                }
            })
        }else{
            frgmnt.replaceWith(content)
        }

        fetcher._endProgress(frgmnt);
    },
    fetch: (frgmnt)=>{
        fetcher._startProgress(frgmnt);
        return fetcher.get(frgmnt);
    },
    getURL:(frgmnt)=> {
        let params = fetcher.getDataAttribute(frgmnt)
        if (frgmnt.hasAttribute(fetcher._fetch)) {
            return frgmnt.getAttribute(fetcher._fetch).split(":")[1] + '?' + params
        } else if (frgmnt.nodeName === 'A') {
            if (frgmnt.hasAttribute(fetcher._href) && frgmnt.getAttribute(fetcher._href).startsWith('javascript')) {
                eval(frgmnt.getAttribute(fetcher._href))
                return undefined
            }
            if (frgmnt.hasAttribute('_href') && frgmnt.getAttribute('_href')) {
                return frgmnt.getAttribute('_href') + '?' + params;
            }
            return frgmnt.getAttribute(this._href) + '?' + params;
        } else if (frgmnt.nodeName === 'FORM' && frgmnt.hasAttribute(fetcher._action)) {
            return frgmnt.getAttribute(fetcher._action)
        }
    },
    getDataAttribute:(element)=>{
        let queryParams = {}
        Object.getOwnPropertyNames(element.dataset).forEach((prop)=>{
            if(element.dataset[prop].startsWith(fetcher._bind)){
                queryParams[prop] = document.querySelector(element.dataset[prop].split(':')[1])?.value
            } else {
                queryParams[prop] = element.dataset[prop]
            }
        });
        return (new URLSearchParams(queryParams)).toString()
    },
    get:async (element)=> {
        let url = fetcher.getURL(element)
        if(url !== undefined) {
            function getAndWait(url) {
                const getRequest= new Request(url, {
                    method: "GET",
                    mode: "no-cors",
                    headers: {'Accept': fetcher._contentType, 'x-fragment-power':fetcher.name}
                });
                return fetch(getRequest).then( function  (response) {
                    return response.text();
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err)
                    return ''
                });
            }
            return await getAndWait(url)
        } else {
            return '';
        }
    }
}
fragment?.tryRun(fetcher);