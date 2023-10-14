window.mouse={
    name:'mouse',
    _attrLeftClickToggle:'mouse-left-click-toggle',
    _attrRightClickToggle:'mouse-right-click-toggle',
    _debouncedMouseClick:null,
    init:()=>{
        fragment.registerTriggerHandler('mouse-left-click',mouse.handle);
        //fragment-trigger="not-visible"
        fragment.registerTriggerHandler('mouse-right-click',mouse.handle);
    },
    dependencyAdded:(dependency)=>{
        if(dependency.name==='toggle'){
            console.log("dependency added")
            mouse.toggleState=dependency.toggleState;
            mouse._debouncedMouseClick =  fragment.debounce(mouse.toggleState,100);
        }else if(dependency.name==='state'){
            //mouse.fetch=dependency.fetch;
        }
    },
    handle:async (frgmnt)=>{
        if(frgmnt.hasAttribute('mouse-left-click-toggle')) {
            await fragment.registerDependency('toggle',mouse);
            if(frgmnt.hasAttribute('mouse-right-click-set')){
                await fragment.registerDependency('state',mouse);
            }
            frgmnt.addEventListener('mousedown', function(event) {
                if (event.button === 0) {
                    mouse._debouncedMouseClick(frgmnt,mouse._attrLeftClickToggle)
                }
            });
        }
        if(frgmnt.hasAttribute('mouse-right-click-set')){

        }
        if(frgmnt.hasAttribute('mouse-right-click-toggle')){
            await fragment.registerDependency('toggle',mouse);
            frgmnt.addEventListener('contextmenu', function(ev) {
                ev.preventDefault();
                mouse._debouncedMouseClick(frgmnt,mouse._attrRightClickToggle)
            }, false);
        }
    }
}