
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
    _lastId :0,
    fetchFragment:window.fragment.fetchFragment,
    _intervals:[],
    init:()=>{},
    handle:async (frgmnt)=>{
        if(frgmnt.hasAttribute(fetcher._trigger)) {
            for (const trg of frgmnt.getAttribute(fetcher._trigger).split('|')) {
                if (trg === 'load') {
                    fetcher.populate(await fetcher.fetch(frgmnt), frgmnt)
                } else if (trg === 'click') {
                    frgmnt.addEventListener('click', async () => {
                        fetcher.populate(await fetcher.fetch(frgmnt), frgmnt)
                    })
                } else if (trg.startsWith('every')) {
                    if(fetcher._intervals[frgmnt.id]===undefined) {
                        fetcher._intervals[frgmnt.id] = setInterval(async () => {
                            fetcher.populate(await fetcher.fetch(frgmnt), frgmnt)
                        }, parseInt(frgmnt.getAttribute(fetcher._trigger).split(":")[1]))
                    }
                }
            }
        }else if (frgmnt.nodeName==='BUTTON'){
            frgmnt.addEventListener('click', async () => {
                fetcher.populate(await fetcher.fetch(frgmnt), frgmnt)
            })
        }
    },
    isHTML:(content)=>{
        let elem = document.createElement('div');
        elem.innerHTML = content;
        return elem.children.length > 0;
    },
    populate:(content, frgmnt)=>{
        let doc = new DOMParser().parseFromString(content, 'text/html')
        doc.querySelectorAll('*[' + fetcher._fetch + ']').forEach((elem)=>{
            if(!elem.hasAttribute("id")){
                elem.id=setHID(elem)
            }
        })
        content=doc.body.innerHTML;
        if(frgmnt.hasAttribute(fetcher._fill)) {
            let fillTarget = frgmnt.getAttribute(fetcher._fill);
            if (fillTarget === "self") {
                frgmnt.innerHTML = content;
                frgmnt.querySelectorAll('*[' + fetcher._fetch + ']').forEach(async (elem) => {
                    await fetcher.handle(elem)
                })
            } else {
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
                    alert(frgmnt.getAttribute(fetcher._fill) + " element does not exist")
                }
            }
        }else if(frgmnt.hasAttribute(fetcher._replace)) {
            frgmnt.replaceWith(content)
        }else if(doc.body.querySelectorAll('*[id]').length>0){//replace by similar id
            doc.body.querySelectorAll('*[id]').forEach(async (elem)=>{
                if(document.getElementById(elem.id) !== null){
                    if('innerHTML' in document.getElementById(elem.id)){
                        document.getElementById(elem.id).innerHTML = elem.innerHTML
                    }else {
                        document.getElementById(elem.id).replaceWith(elem)
                    }
                    if(elem.id !== frgmnt.id) {
                        await fetcher.handle(document.getElementById(elem.id))
                    }
                }
            })
        }
        fragment.events.publish(fragment.events.ajax_end,frgmnt);
    },
    fetch: (frgmnt)=>{
        fragment.events.publish(fragment.events.ajax_start,frgmnt);
        let url = getURL(frgmnt,fetcher._fetch)
        const request= new Request(url, {
            method: getMethod(frgmnt,fetcher._fetch),
            mode: "no-cors",
            headers: {'Accept': fetcher._contentType, 'x-fragment-power':fetcher.name}
        });
        return fetcher.fetchFragment(request);
    },
}
fragment?.tryRun(fetcher);