window.webcom={
    name:'webcom',
    _prepareSelectors:['webcom-fetch'],
    _triggerAttribute:'fragment-trigger',
    elemOrigInnerText:[],
    _components:[],
    _componentsScripts:[],
    scriptId:0,
    getNewScriptId:()=>{
        webcom.scriptId++;
        return 'comp'+webcom.scriptId
    },
    getName:()=>{
        return webcom.name
    },
    init:()=>{
        frgmt.registerTriggerHandler('load', webcom.handle);
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
    create:(htmlStr)=> {
        var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    },
    createScript:(name,scriptContent)=>{
        const id = webcom.getNewScriptId();
        var newScript = document.createElement("script");
        scriptContent=scriptContent.replaceAll(name, name+id)
        var inlineScript = document.createTextNode(scriptContent);
        newScript.appendChild(inlineScript);
        document.head.appendChild(newScript);
        return name+id;
    },
    execute: (frgmnt, selector)=>{
        if(selector==='webcom-fetch'){
            return webcom.fetch(frgmnt,selector).then((result)=>{
                let doc = new DOMParser().parseFromString(result, 'text/html').body.children[0]
                let name = result.substring(1,result.indexOf(" "))
                webcom._components[name]=doc;
                webcom._components[name].querySelectorAll('script').forEach((script)=>{
                    if(webcom._componentsScripts[name]===undefined){
                        webcom._componentsScripts[name]=[]
                    }
                    webcom._componentsScripts[name][webcom._componentsScripts[name].length]=script
                    webcom._components[name].removeChild(script)

                    let id = webcom.createScript(name,script.innerHTML);
                    webcom._components[name].innerHTML=webcom._components[name].innerHTML.replaceAll(name+".", id+".")
                    frgmnt.appendChild(webcom.create(webcom._components[name].innerHTML));
                })
               console.log(doc);
            })
        }
    }
    ,
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