
// toggle-prop=".disabled=false|true"
// toggle-prop=".disabled=false|remove"
// toggle-prop=".element-id.visible=false/remove|"
// toggle-prop="#element-id.disabled=false/remove"
// toggle-prop="#element-id.class=frm-field/remove"
//#elementModal.style.display=block/remove
//#elementModal.disabled=true/remove
//#elementModal.classList=mystyle
window.toggle=(()=>{
    const config = {
        name: 'toggle',
        _toggleProp: 'toggle-target',
        _toggleTrigger: 'toggle-trigger',
    }
    return {
        init: () => {
            frgmt.events.subscribe(frgmt.events.ajax_start, config.toggleState)
            frgmt.events.subscribe(frgmt.events.ajax_end, config.toggleState)
        },
        getName:()=>{
            return config.name
        },
        //#elementModal.style.display=block/remove
        //#elementModal.disabled=true/remove
        //#elementModal.classList=mystyle
        toggleState: (frgmnt0, attr, frgmnt1 = null, prop = [], values = []) => {
             if (frgmnt1===null) {
                if (frgmnt0.getAttribute(attr) !== null) {
                    let targets = frgmnt0.getAttribute(attr).split('|')
                    targets.forEach((trgt) => {
                        trgt=trgt.trim()
                        let selectorProp = trgt.substring(0, trgt.indexOf('=', 0)).split(".")
                        let propValues = trgt.split('=')
                        let options = propValues[1].split('/')
                        if (selectorProp[0] === 'self') {
                            toggle.toggleState(frgmnt0, attr, frgmnt0, selectorProp, options)
                        } else if (selectorProp[0].startsWith('.')) {
                            document.querySelectorAll(selectorProp[0]).forEach((elem) => {
                                toggle.toggleState(frgmnt0, attr, elem, selectorProp, options)
                            })
                        } else if (selectorProp[0].startsWith('#')) {
                            if (document.querySelector(selectorProp[0]) !== null) {
                                toggle.toggleState(frgmnt0, attr, document.querySelector(selectorProp[0]), selectorProp, options)
                            }
                        }
                    })
                }
            } else {
                if ('hasAttribute' in frgmnt1 && prop.length !== 0 && values != null) {
                    if (prop.length === 3) {
                        const val3 = String(frgmnt1[prop[1]][prop[2]]);
                        if(values[0]===val3 && values[1]!==undefined){
                            frgmnt1[prop[1]][prop[2]]=values[1]
                        }else if(values[0]===val3 && values[1]===undefined){
                            frgmnt1[prop[1]][prop[2]]=''
                        }else{
                            frgmnt1[prop[1]][prop[2]]=values[0]
                        }
                        frgmt.events.publish(frgmnt1.id+'.'+prop[1]+'.'+prop[2]+'='+frgmnt1[prop[1]][prop[2]],frgmnt1)
                    } else if (prop.length === 2) {
                        const val2 = String(frgmnt1[prop[1]]);
                        if (prop[1] === 'classList') {
                            frgmnt1.classList.toggle(values[0])
                            frgmt.events.publish(frgmnt1.id+'.classList='+values[0],frgmnt1)
                        }else if (frgmnt1.hasAttr(prop[1])) {
                           if (val2 === values[0]) {
                                if (String(values[1]) === 'remove') {
                                    frgmnt1.removeAttribute(prop[1])
                                } else {
                                    frgmnt1[prop[1]] = values[1]
                                }
                            } else {
                                frgmnt1[prop[1]] = values[0]
                            }
                            frgmt.events.publish(frgmnt1.id+'.'+prop[1]+'='+frgmnt1[prop[1]],frgmnt1)
                        } else {
                            frgmnt1[prop[1]] = values[0]
                        }
                    }
                }else{
                    console.error(frgmnt1.nodeType+"."+frgmnt1.id + " invalid toggle setting")
                }
            }
        },
        handle: (frgmnt) => {
            if (frgmnt.hasAttribute(config._toggleProp)) {
                if (frgmnt.hasAttribute(config._toggleTrigger)) {

                } else if (frgmnt.nodeName === 'BUTTON') {
                    frgmnt.addEventListener('click', () => {
                        toggle.toggleState(config._toggleProp, frgmnt)
                    })
                }
            }
            console.log('progress')
        }
    }
})();