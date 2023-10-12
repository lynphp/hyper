window.env='dev'
const f = {
    scripts:[],
    directive:'',
    selector :'',
    basePath:'',
    pendingScripts:0,
    readyScripts:0,
    events: {
        topics : [],
        publish: (topic, frgmnt) => {
            if (!f.events.topics[topic]===undefined) return;

            f.events.topics[topic].forEach((cbck) => {
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
    handle:(frgmnt)=>{
        console.log(frgmnt)
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
                let mdls = frgmnt.getAttribute(fragment.directive).split("|")
                mdls.forEach((mld) => {
                    if (mld !== "") {
                        f[mld].handle(frgmnt)
                    }
                })
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
                scrt.src = f.basePath+ mdl +".js";
                document.head.appendChild(scrt);
                scrt.onload=()=>{
                    console.log(mdl+' loaded')
                }
            }
        })
    },
    start:(drctv='fragment',basePath="/assets/")=>{
        f.directive=drctv
        f.selector='*['+f.directive +']'
        f.basePath=basePath
        document.querySelectorAll(f.selector).forEach((frgmnt)=> {
            f.loadScripts(frgmnt)
        });
    },
}
window.fragment=f
document.onreadystatechange=(e)=>{
    fragment.start('fragment',"/hyper/")
    //fragment.start()
}
document.addEventListener('ready',()=>{
    while(f.scripts.length!==f.readyScripts){
        setTimeout({},10)
    }
    fragment.initElements()
})