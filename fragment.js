window.env='dev'
const f = {
    scripts:[],
    directive:'',
    selector :'',
    basePath:'',
    pendingScripts:0,
    readyScripts:0,
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
         subscribe: (topic, callback) => {
             if (f.events.topics[topic]===undefined){
                 f.events.topics[topic]=[]
             }
             f.events.topics[topic][f.events.topics[topic].length]=callback;
        },
        ajax_start:'ajax_start',
        ajax_end:'ajax_end',
    },
    uid :  ()=> {
        return f._uid + (++f._lastId)
    },
    handle:(frgmnt)=>{
        let mdls = frgmnt.getAttribute(fragment.directive).split("|")
        mdls.forEach((mld) => {
            if (mld !== "") {
                f[mld].handle(frgmnt)
            }
        })
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
            if(mdl!=="" && f.scripts[mdl]===undefined){
                f.pendingScripts++;
                f.scripts[mdl]=true;
                let scrt = document.createElement('script');
                scrt.src = window.jslib[mdl];
                document.head.appendChild(scrt);
                scrt.onload=()=>{
                    console.log(mdl+' loaded')
                }
            }
        })
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