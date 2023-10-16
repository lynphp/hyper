window.component=(cb)=>{
    let obj ={};
    for (let prop in cb) {
        if( typeof cb[prop] === 'function'){
            obj[cb[prop].name] = ((fn) => {
                 function callMe(...params){
                     fn.apply(this, params);
                     console.log(params)
                }
                return callMe
            })(cb[cb[prop].name])
        }else{
            var val=cb[prop]
            //obj[cb[prop]]=prop
            Object.defineProperty(obj, prop, {
                get() {
                    return val
                },
                set(value) {
                    val=value
                }
            });
        }
    }
    return obj
}
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
    createFragment:(componentId,htmlStr)=> {
        let frag = document.createDocumentFragment()
        let temp = document.createElement('div');
        temp.innerHTML = htmlStr;
        frag.id = componentId;
        while (temp.firstChild) {
            frag.appendChild(temp.firstChild);
        }
        return frag;
    },
    createScript:(name,scriptContent)=>{
        const id = webcom.getNewScriptId();
        var newScript = document.createElement("script");
        scriptContent=scriptContent.replaceAll(name, name+'_'+id)
        scriptContent=scriptContent+`\n//# sourceURL=${name}_${id}.js`
        var inlineScript = document.createTextNode(scriptContent);
        newScript.appendChild(inlineScript);
        document.head.appendChild(newScript);
        return name+'_'+id;
    },
    execute: (frgmnt, selector)=>{
        if(selector==='webcom-fetch'){
            return webcom.fetch(frgmnt,selector).then((result)=>{
                let doc = new DOMParser().parseFromString(result.trim(), 'text/html').body.children[0]
                let name = result.trim().substring(1,result.trim().indexOf(" "))
                webcom._components[name]=doc;
                webcom._components[name].querySelectorAll('script').forEach((script)=>{
                    if(webcom._componentsScripts[name]===undefined){
                        webcom._componentsScripts[name]=[]
                    }
                    webcom._componentsScripts[name][webcom._componentsScripts[name].length]=script
                    webcom._components[name].removeChild(script)

                    let componentId = webcom.createScript(name,script.innerHTML);
                    webcom._components[name].innerHTML=webcom._components[name].innerHTML.replaceAll(name+".", componentId+".")
                    frgmnt.appendChild(webcom.createFragment(componentId,webcom._components[name].innerHTML));
                })
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