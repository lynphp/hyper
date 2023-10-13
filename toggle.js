
// toggle-prop=".disabled=false|true"
// toggle-prop=".disabled=false|remove"
// toggle-prop=".element-id.visible=false|remove"
// toggle-prop="#element-id.disabled=false|remove"
// toggle-prop="#element-id.class=frm-field|remove"
const toggle={
    name:'toggle',
    _toggleProp:'toggle-target',
    _toggleTrigger:'toggle-trigger',
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,toggle.toggleState)
        fragment.events.subscribe(fragment.events.ajax_end,toggle.toggleState)
    },
    toggleState:(frgmnt0, frgmnt1= null,prop=[],values=[])=>{
        if(frgmnt1===null){
            frgmnt1 = document.createElement('div')
            frgmnt1.setAttribute(toggle._toggleProp,'')
        }
        if(frgmnt0.id !== frgmnt1.id && frgmnt1.hasAttribute(toggle._toggleProp)){
            if(frgmnt0.getAttribute(toggle._toggleProp)!==null){
                let targets = frgmnt0.getAttribute(toggle._toggleProp).split(',')
                targets.forEach((trgt) => {
                    let selectorProp = trgt.substring(0, trgt.indexOf('=', 0)).split(".")
                    let propValues = selectorProp[1].split('=')
                    let options = trgt.split('=')[1].split('|')
                    if (selectorProp[0] === 'self') {
                        toggle.toggleState(frgmnt0,frgmnt1,selectorProp,options)
                    }else if (selectorProp[0].startsWith('.')) {
                        document.querySelectorAll(selectorProp[0]).forEach((elem)=>{
                            toggle.toggleState(frgmnt0,elem,selectorProp,options)
                        })
                    }else if (selectorProp[0].startsWith('#')) {
                        if (document.querySelector(selectorProp[0])!==undefined){
                            toggle.toggleState(frgmnt0,document.querySelector(selectorProp[0]),selectorProp,options)
                        }
                    }
                })
            }
        }else{
            if('hasAttribute' in frgmnt1 && prop.length!==0 && values!=null){
                if(prop.length===3){
                    if(String(frgmnt1[prop[1]][prop[2]])===values[0]){
                        frgmnt1[prop[1]][prop[2]]=values[1]
                    }else{
                        frgmnt1[prop[1]][prop[2]]=values[0]
                    }
                }
                if(prop.length===2){
                    if(String(frgmnt1[prop[1]])===values[0]){
                        if(String(values[1])==='remove'){
                            frgmnt1.removeAttribute(prop[1])
                        }else{
                            frgmnt1[prop[1]]=values[1]
                        }
                    }else{
                        frgmnt1[prop[1]]=values[0]
                    }
                }
            }
        }
    },
    handle:(frgmnt)=>{
        if(frgmnt.hasAttribute(toggle._toggleProp)){
            if(frgmnt.hasAttribute(toggle._toggleTrigger)){

            }else if(frgmnt.nodeName==='BUTTON'){
                frgmnt.addEventListener('click',()=>{
                    toggle.toggleState(frgmnt)
                })
            }
        }
        console.log('progress')
    }
}
fragment?.tryRun(toggle);