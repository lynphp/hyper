const toggle={
    name:'toggle',
    _toggleProp:'toggle-prop',
    init:()=>{
        fragment.events.subscribe(fragment.events.ajax_start,toggle.toggleState)
        fragment.events.subscribe(fragment.events.ajax_end,toggle.toggleState)
    },
    // toggle-prop="disabled:false|true"
    toggleState:(frgmnt)=>{
        if(frgmnt.hasAttribute(toggle._toggleProp)) {
            let prop = frgmnt.getAttribute(toggle._toggleProp).split(':')
            let values = prop[1].split('|')
            if(!frgmnt.hasAttribute(prop[0])) {
                frgmnt.setAttribute(prop[0], values[1])
            } else if(frgmnt.hasAttribute(prop[0]) && frgmnt.getAttribute(prop[0])===values[1]){
                frgmnt.removeAttribute(prop[0])
            }
        }
    },
    handle:(frgmnt)=>{
        console.log('progress')
    }
}
fragment?.tryRun(toggle);