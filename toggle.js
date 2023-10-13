const toggle={
    name:'toggle',
    _toggleProp:'toggle-target',
    _toggleTrigger:'toggle-trigger',
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,toggle.toggleState)
        fragment.events.subscribe(fragment.events.ajax_end,toggle.toggleState)
    },
    // toggle-prop=".disabled=false|true"
    // toggle-prop=".disabled=false|remove"
    // toggle-prop=".element-id.visible=false|remove"
    // toggle-prop="#element-id.disabled=false|remove"
    // toggle-prop="#element-id.class=frm-field|remove"
    toggleState:(frgmnt0, frgmnt1= null,prop='',values=[])=>{
        if(frgmnt1===null){
            frgmnt1 = document.createElement('div')
            frgmnt1.id='abc123-5'
        }
        if(frgmnt0.id !== frgmnt1.id && !frgmnt1.getAttribute(toggle._toggleProp)){
            if(frgmnt1.id==='abc123-5') {
                frgmnt1 = frgmnt0
            }
            if(frgmnt0.getAttribute(toggle._toggleProp)!==null){
                let targets = frgmnt0.getAttribute(toggle._toggleProp).split(',')
                targets.forEach((trgt) => {
                    let selectorProp = trgt.substring(0, trgt.indexOf('=', 0)).split(".")
                    let propValues = selectorProp[1].split('=')
                    let options = trgt.split('=')[1].split('|')
                    if (selectorProp[0] === 'self') {
                        toggle.toggleState(frgmnt0,frgmnt1,propValues[0],options)
                    }else if (selectorProp[0].startsWith('.')) {
                        document.querySelectorAll(selectorProp[0]).forEach((elem)=>{
                            toggle.toggleState(frgmnt0,elem,propValues[0],options)
                        })
                    }else if (selectorProp[0].startsWith('#')) {
                        if (document.querySelector(selectorProp[0])!==undefined){
                            toggle.toggleState(frgmnt0,document.querySelector(selectorProp[0]),propValues[0],options)
                        }
                    }
                })
            }
        }else{
            if('hasAttribute' in frgmnt1){
                if(!frgmnt1.hasAttribute(prop[0]) && frgmnt1.getAttribute(prop[0])===values[0]) {
                    frgmnt1.setAttribute(prop[0], values[1])
                } else if(frgmnt1.hasAttribute(prop[0]) && frgmnt1.getAttribute(prop[0])===values[1]){
                    frgmnt1.setAttribute(prop[0], values[0])
                } else if(frgmnt1.hasAttribute(prop[0]) && values[1] === 'remove'){
                    frgmnt1.removeAttribute(prop[0])
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