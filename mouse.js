window.mouse={
    name:'mouse',
    _attrLeftClickToggle:'mouse-left-click-toggle',
    _attrRightClickToggle:'mouse-right-click-toggle',
    _elementsState: [],
    _debouncedMouseClick:null,
    getName:()=>{
        return mouse.name
    },
    init:()=>{
        frgmt.registerTriggerHandler('mouse-left-click',mouse.handle);
        //fragment-trigger="not-visible"
        frgmt.registerTriggerHandler('mouse-right-click',mouse.handle);
    },
    dependencyAdded:(dependency)=>{
        if(dependency.getName()==='toggle'){
            console.log("dependency added")
            mouse.toggleState=dependency.toggleState;
            mouse._debouncedMouseClick =  frgmt.debounce(mouse.toggleState,100);
        }else if(dependency.getName()==='state'){
            //mouse.fetch=dependency.fetch;
        }
    },
    handle:async (frgmnt)=>{
        if(frgmnt.hasAttribute('mouse-left-click-toggle')) {
            if(mouse._elementsState['mouse-left-click-toggle'+'-'+frgmnt.id]===undefined) {
                mouse._elementsState['mouse-left-click-toggle'+'-'+frgmnt.id]=true;
                await frgmt.registerDependency('toggle', mouse);
                if (frgmnt.hasAttribute('mouse-right-click-set')) {
                    await frgmt.registerDependency('state', mouse);
                }
                frgmnt.addEventListener('click', ( function (event) {
                    if (event.button === 0) {
                        mouse.toggleState(frgmnt, mouse._attrLeftClickToggle)
                    }
                }))
            }
        }
        if(frgmnt.hasAttribute('mouse-right-click-set')){
            if(mouse._elementsState['mouse-right-click-set'+'-'+frgmnt.id]===undefined) {
                mouse._elementsState['mouse-right-click-set'+'-'+frgmnt.id]=true;

            }

        }
        if(frgmnt.hasAttribute('mouse-right-click-toggle')){
            if(mouse._elementsState['mouse-right-click-toggle'+'-'+frgmnt.id]===undefined) {
                mouse._elementsState['mouse-right-click-toggle' + '-' + frgmnt.id] = true;
                await frgmt.registerDependency('toggle',mouse);
                frgmnt.addEventListener('contextmenu', function(ev) {
                    ev.preventDefault();
                    mouse.toggleState(frgmnt,mouse._attrRightClickToggle)
                }, false);
            }
        }
    }
}