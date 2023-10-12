window.env='dev'
const f = {
    scripts:[],
    directive:'',
    selector :'',
    basePath:'',
    pendingScripts:0,
    readyScripts:0,
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
            f.handle(frgmnt)
            let mdls = frgmnt.getAttribute(fragment.directive).split("|")
            mdls.forEach((mld)=>{
                f[mld].handle(frgmnt)
            })
        });
    },
    loadScripts:(frgmnt)=>{
        let mdls = frgmnt.getAttribute(fragment.directive).split("|")
        mdls.forEach((mdl)=>{
            if(f.scripts[mdl]===undefined){
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
    console.log(e)
    //fragment.start('fragment',"/assets/")
    fragment.start()
}
document.addEventListener('ready',()=>{
    while(f.scripts.length!==f.readyScripts){
        setTimeout({},10)
    }
    fragment.initElements()
})