window.state=(()=>{
    let config ={
        name:'state',
        visible:{},
        scrollDebounceRate:10
    }
    let states={
        _elementStates: [],
        _elements: [],
        _elementsState: [],
    }
    let events={
        visible:{},
        notvisible:{}
    }
    let internal ={
        isElementInViewport: (elem) => {
            let rect = elem.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },
        checkElements: () => {
            states._elements.forEach((elemId) => {
                internal.checkElement(document.getElementById(elemId));
            })
        },
        checkElement: (frgmnt) => {
            if (internal.isElementInViewport(frgmnt)) {
                if (states._elementsState[frgmnt.id + '.visible'] === undefined) {
                    states._elementsState[frgmnt.id + '.visible'] = config.visibility.visible
                    frgmnt.dispatchEvent(events.visible);
                }
            } else {
                states._elementsState[frgmnt.id + '.notvisible'] = config.visibility.not_visible
                frgmnt.dispatchEvent(events.notvisible);
            }
        },
    }
    let handlers = {
        visible:(elem)=>{

        },
        notvisible:(elem)=>{

        }
    }
    return {
        init:()=>{
            events.visible = new CustomEvent("visible");
            events.notvisible = new CustomEvent("notvisible");
            window.addEventListener("scroll", fragment.debounce(internal.checkElements, config._scrollDebounceRate));
        },
        handle:(elem)=>{
            for(const event in events){
                elem.addEventListener(event.name, function (ev) {
                    handlers[ev.name](elem)
                });
            }
        },
        getName:()=>{
            return state.name;
        }
    }
})()