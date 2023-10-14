/**
 * fragment="<modules>"
 * fragment-trigger="visible"
 * visibility-fetch="GET:/url"
 * visibility-fetch="GET:/url"
 */


window.env='dev'
const f = {
    scripts:[],
    directive:'',
    selector :'',
    basePath:'',
    _trigger:'fragment-trigger',
    _triggers:[],
    pendingScripts:0,
    readyScripts:0,
    _registerHandlersQueue:[],
    _lastId:0,
    _uid:'id',
    events: {
        topics : [],
        publish: (topic, frgmnt) => {
            if (f.events.topics[topic]===undefined) return;
            f.events.topics[topic]?.forEach((cbck) => {
                cbck(frgmnt)
            });
         },
         subscribe: (topic, callback, name='a library') => {
            if(f.events[topic]===undefined){
                f.events.registerTopic(topic)
            }
             if (f.events.topics[topic]===undefined){
                 f.events.topics[topic]=[]
             }
             f.events.topics[topic][f.events.topics[topic].length]=callback;
             console.debug(name + ' just registered to ' + topic)
        },
        registerTopic:(newTopic)=>{
            f.events[newTopic]=newTopic
            console.debug('registerTopic:' + newTopic)
        },
        ajax_start:'ajax_start',
        ajax_end:'ajax_end',
        init_yours:'init_yours',
    },
    uid :  ()=> {
        return f._uid + (++f._lastId)
    },
    handle:(frgmnt)=>{
        setHID(frgmnt)
        if(frgmnt.getAttribute(fragment._trigger)!==null){
            let trgrs = frgmnt.getAttribute(fragment._trigger).split("|")
            trgrs.forEach((trg)=>{
                if(f._triggers[trg]!==undefined){
                    f._triggers[trg](frgmnt);
                }
            })
        }
    },
    registerTriggerHandler:(trigger, callback)=>{
        if(f._triggers[trigger]===undefined){
            f._triggers[trigger]=callback
        }else{
            console.warn(trigger + ' is already registered')
        }
    },
    registerDependency:async (module)=>{
        f.loadDependency(module)
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
    tryRun:(fn)=>{
        f[fn.name]=fn
        f[fn.name].init()
        f.readyScripts++;
       if(f.pendingScripts===f.readyScripts){
           f.initElements()
        }
    },
    initElements:()=>{
        document.querySelectorAll(f.selector).forEach((frgmnt)=> {
            if(frgmnt.nodeName!=="BODY") {
                f.handle(frgmnt)
            }
        });
    },
    loadScripts:(frgmnt)=>{
        let mdls = frgmnt.getAttribute(fragment.directive).split("|")
        mdls.forEach((mdl)=>{
            f.loadDependency(mdl)
        })
    },
    loadDependency:(mdl)=>{
        if(mdl!=="" && f.scripts[mdl]===undefined && window.jslib[mdl]!==undefined){
            f.pendingScripts++;
            f.scripts[mdl]=true;
            let scrt = document.createElement('script');
            scrt.src = window.jslib[mdl];
            document.head.appendChild(scrt);
            scrt.onload=()=>{
                console.log(mdl+' loaded')
                return true;
            }
        }else{
            if(f.scripts[mdl]!==undefined){
                //console.warn('already load ' + mdl)
            }else{
                console.error('cant load ' + mdl +'.js')
            }
            return false;
        }
    },
    initGlobal:()=>{
        window.getURL=(frgmnt,attr='')=> {
            let params = getDataAttribute(frgmnt)
            if (frgmnt.hasAttribute(attr)) {
                return frgmnt.getAttribute(attr).split(":")[1] + '?' + params
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
        }
        window.getMethod=(frgmnt, attr)=>{
            return frgmnt.getAttribute(attr).split(":")[0]
        },
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
                if (!frgmnt.hasAttribute(f._uid)) {
                    frgmnt.setAttribute(f._uid,f.uid())
                }
            }
        }
    },
    start:(drctv='fragment',basePath="/assets/")=>{
        f.initGlobal()
        f.directive=drctv
        f.selector='*['+f.directive +']'
        f.basePath=basePath
        document.querySelectorAll(f.selector).forEach((frgmnt)=> {
            f.loadScripts(frgmnt)
        });
    },
    fetchFragment:async (request)=> {
        function getAndWait(request) {
            return fetch(request).then( async function   (response) {
                return await response.text();
            }).catch(function (err) {
                console.log('Failed to fetch page: ', err)
                return ''
            });
        }
        return await getAndWait(request)
    },
}
window.fragment=f
document.onreadystatechange=(e)=>{
    fragment.start('fragment',"/assets/fragment/")
    //fragment.start()
}
document.addEventListener('ready',()=>{
    while(f.scripts.length!==f.readyScripts){
        setTimeout({},10)
    }
    fragment.initElements()
})