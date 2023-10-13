const webcom={
    name:'webcom',
    _prepareSelectors:['webcom-fetch'],
    _triggerAttribute:'webcom-trigger',
    elemOrigInnerText:[],
    _components:[],
    init:()=>{
    },
    handle:(frgmnt)=>{
        webcom._prepareSelectors.forEach((selector)=>{
            if(frgmnt.hasAttribute(selector)){
                webcom.prepare(frgmnt)
            }
        })
        console.log('webcom handle')
    },
    prepare:(frgmnt)=>{
        if(frgmnt.hasAttribute(webcom._triggerAttribute)){
            let trgr = frgmnt.getAttribute(webcom._triggerAttribute)
            if(trgr==='load'){
                webcom.triggered(frgmnt);
            }
        }
    },
    triggered:(frgmnt)=>{
        webcom._prepareSelectors.forEach((selector)=>{
            webcom.execute(frgmnt,selector);
        })
    },
    execute: (frgmnt, selector)=>{
        if(selector==='webcom-fetch'){
            return webcom.fetch(frgmnt,selector).then((result)=>{
                let doc = new DOMParser().parseFromString(result, 'text/html').body.children[0]
                doc.childNodes.forEach((elem)=>{
                    webcom.processNodes(elem)
                })
               console.log(doc.innerHTML);
            })
        }
    },
    /**
     *
     * @param node HTMLElement
     */
    processNodes:(frgmnt)=>{
        setHID(frgmnt)
        frgmnt.childNodes.forEach((elem)=>{
            webcom.processNodes(elem)
        })
    },
    fetch:(frgmnt, selector)=>{
        //const _fetch=((frgmnt, selector)=>{
            return webcom.get(frgmnt, selector)
       // })
       // return _fetch(frgmnt, selector);
    },
    get:async  (element, attr)=> {
        let url = getURL(element,attr)
        const fetchAndWait = (url) =>{
            const request= new Request(url, {
                method: "GET",
                mode: "no-cors",
                headers: {'Accept': 'text/html', 'x-fragment-power':''}
            });
            return fetch(request).then(async (response) =>{
                return await response.text();
            }).catch(function (err) {
                console.log('Failed to fetch page: ', err)
                return ''
            });
        }
        return await fetchAndWait(url);
    }
}
fragment?.tryRun(webcom);