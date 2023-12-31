
window.fragment = (function () {
    let config = {
        name:'FragmentJS',
        version:'0.1.0',
        directive: '',
        selector: '',
        basePath: '',
        triggerAttr: 'fragment-trigger',
    }
    let state={
        pendingScripts:0,
        readyScripts:0,
        scripts:[],
        triggers:[],
        lastId:0,
        uid:'id',
        topics : [],
    }
    //internal API
    let privateAPI=(()=>{
        return {
            uid :  ()=> {
                return state.uid + (++state.lastId)
            },
            initGlobal:()=>{
                HTMLElement.prototype.hasAttr=function(qualifiedName){
                    return this.hasAttribute(qualifiedName)
                }
                String.prototype.contains=function(chars){
                    return this.indexOf(chars)>-1;
                }
                HTMLElement.prototype.setAttr=function(qualifiedName,value){
                    return this.setAttribute(qualifiedName,value)
                }
                HTMLElement.prototype.getAttr=function(qualifiedName){
                    return this.getAttribute(qualifiedName)
                }
                /**
                 *
                 * @param frgmnt HTMLElement
                 * @param attr
                 * @returns {undefined|string}
                 */
                window.getURL=(frgmnt,attr='')=> {
                    let params = getDataAttribute(frgmnt)
                    if (frgmnt.hasAttr(attr)) {
                        let segments = frgmnt.getAttr(attr).split(":");
                        if(segments.length>2){
                            return segments[1] +":"+ segments[2] + '?' + params
                        }else{
                            return segments[1] + '?' + params;
                        }
                    } else if (frgmnt.nodeName === 'A') {
                        if (frgmnt.hasAttr(fetcher._href) && frgmnt.getAttr(fetcher._href).startsWith('javascript')) {
                            eval(frgmnt.getAttr(fetcher._href))
                            return undefined
                        }
                        if (frgmnt.hasAttr('_href') && frgmnt.getAttr('_href')) {
                            return frgmnt.getAttr('_href') + '?' + params;
                        }
                        return frgmnt.getAttr(this._href) + '?' + params;
                    } else if (frgmnt.nodeName === 'FORM' && frgmnt.hasAttr(fetcher._action)) {
                        return frgmnt.getAttr(fetcher._action)
                    }
                }
                window.getMethod=(frgmnt, attr)=>{
                    return frgmnt.getAttr(attr).split(":")[0]
                }
                window.getDataAttribute=(element)=> {
                    let queryParams = {}
                    Object.getOwnPropertyNames(element.dataset).forEach((prop) => {
                        if (element.dataset[prop].startsWith("bind")) {
                            queryParams[prop] = document.querySelector(element.dataset[prop].split(':')[1])?.value
                        } else {
                            queryParams[prop] = element.dataset[prop]
                        }
                    });
                    return (new URLSearchParams(queryParams)).toString()
                }
                window.setHID=(frgmnt)=>{
                    if('hasAttribute' in frgmnt){
                        if (!frgmnt.hasAttr(state.uid)) {
                            frgmnt.setAttribute(state.uid,privateAPI.uid())
                        }
                    }
                }
            },
            initElements:()=>{
                document.querySelectorAll(config.selector).forEach((frgmnt)=> {
                    if(frgmnt.nodeName!=="BODY") {
                        publicAPI.handle(frgmnt)
                    }
                });
            },
            loadDependency:async (mdl, dependent=null)=>{
                if(mdl!=="" && state.scripts[mdl]===undefined && window.jslib!== undefined && window.jslib[mdl]!==undefined){
                    state.pendingScripts++;
                    state.scripts[mdl]=true;
                    return import(window.jslib[mdl]).then(()=>{
                        //let scrt = document.createElement('script');
                        //scrt.src = window.jslib[mdl];
                        //document.head.appendChild(scrt);
                        if(dependent!==null){
                            dependent['dependencyAdded'](window[mdl])
                        }
                        publicAPI.tryRun(window[mdl])
                        return true;
                    })
                }else{
                    if(state.scripts[mdl]!==undefined){
                    }else{
                        console.error('cant load ' + mdl +'.js')
                    }
                    return false;
                }
            },
            loadScripts:(frgmnt)=>{
                let mdls = frgmnt.getAttribute(config.directive).split("|")
                mdls.forEach((mdl)=>{
                    privateAPI.loadDependency(mdl)
                })
            },
        }
    })()
    //internal API
    let publicAPI=(()=>{
        return {
            start: (directive = 'data-fragment', basePath = "/assets/fragment/") => {
                privateAPI.initGlobal()
                config.directive = directive
                config.selector = '*[' + config.directive + ']'
                config.basePath = basePath
                document.querySelectorAll(config.selector).forEach((frgmnt) => {
                    privateAPI.loadScripts(frgmnt)
                });
                return true
            },
            tryRun:(fn)=>{
                state[fn.getName()]=fn
                state[fn.getName()].init()
                if('init' in state[fn.getName()]){
                    state[fn.getName()].init()
                    state.readyScripts++;
                    if(state.pendingScripts===state.readyScripts){
                        privateAPI.initElements()
                    }
                }else{
                    alert(fn.getName() + '.init() method is undefined.')
                }
            },
            registerTriggerHandler:(trigger, callback)=>{
                if(state.triggers[trigger]===undefined){
                    state.triggers[trigger]=callback
                }
            },
            handle:(frgmnt)=>{
                setHID(frgmnt)
                if(frgmnt.getAttribute(config.triggerAttr)!==null){
                    let trgrs = frgmnt.getAttribute(config.triggerAttr).split("|")
                    trgrs.forEach((trg)=>{
                        if(state.triggers[trg]!==undefined){
                            state.triggers[trg](frgmnt);
                        }
                    })
                }
            },
            isHTML: (content) => {
                let elem = document.createElement('div');
                elem.innerHTML = content;
                return elem.children.length > 0;
            },
            /**
             *
             * @param func
             * @param delay
             * @returns {(function(...[*]): void)|*}
             */
            debounce:(func, delay)=> {
                let timeoutId;
                return function(...args) {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    timeoutId = setTimeout(() => {
                        func.apply(this, args);
                    }, delay);
                };
            },
            events: {
                publish: (topic, frgmnt) => {
                    console.debug('topic:',topic)
                    if (state.topics[topic]===undefined) return;
                    state.topics[topic]?.forEach((cbck) => {
                        if(cbck!==undefined) {
                            cbck(frgmnt)
                        }
                    });
                },
                subscribe: (topic, callback, name='a library') => {
                    if(state.topics[topic]===undefined){
                        publicAPI.events.registerTopic(topic)
                    }
                    if (state.topics[topic][state.topics[topic].length]===undefined){
                        state.topics[topic]=[]
                    }
                    state.topics[topic][state.topics[topic].length]=callback;
                },
                registerTopic:(newTopic)=>{
                    state.topics[newTopic]=newTopic
                },
                ajax_start:'ajax_start',
                ajax_end:'ajax_end',
                init_yours:'init_yours',
            },
            registerDependency:async (module, dependent)=>{
                await privateAPI.loadDependency(module, dependent)
            },
        }
    })()
    return publicAPI
})()
window.addEventListener("load", ()=>fragment.start());