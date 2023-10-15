
// toggle-prop=".disabled=false|true"
// toggle-prop=".disabled=false|remove"
// toggle-prop=".element-id.visible=false/remove|"
// toggle-prop="#element-id.disabled=false/remove"
// toggle-prop="#element-id.class=frm-field/remove"
window.toggle=(()=>{
    var config = {
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
        toggleState: (frgmnt0, attr, frgmnt1 = null, prop = [], values = []) => {
            if (frgmnt1 === null) {
                frgmnt1 = document.createElement('div')
                frgmnt1.setAttribute(attr, '')
            }
            if (frgmnt0.id !== frgmnt1.id && frgmnt1.hasAttribute(attr)) {
                if (frgmnt0.getAttribute(attr) !== null) {
                    let targets = frgmnt0.getAttribute(attr).split('|')
                    targets.forEach((trgt) => {
                        let selectorProp = trgt.substring(0, trgt.indexOf('=', 0)).split(".")
                        let propValues = trgt.split('=')
                        let options = propValues[1].split('/')
                        if (selectorProp[0] === 'self') {
                            toggle.toggleState(frgmnt0, attr, frgmnt1, selectorProp, options)
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
                        if (String(frgmnt1[prop[1]][prop[2]]) === values[0]) {
                            if (values[1] === 'remove') {
                                document.getElementById(frgmnt1.id).removeAttribute(prop[1])
                            } else {
                                frgmnt1[prop[1]][prop[2]] = values[1]
                            }
                        } else if (values[1] === 'remove') {
                            document.getElementById(frgmnt1.id).removeAttribute(prop[2])
                        } else {
                            frgmnt1[prop[1]][prop[2]] = values[0]
                        }
                    }
                    if (prop.length === 2) {
                        if (String(frgmnt1[prop[1]]) === values[0]) {
                            if (String(values[1]) === 'remove') {
                                frgmnt1.removeAttribute(prop[1])
                            } else {
                                frgmnt1[prop[1]] = values[1]
                            }
                        } else {
                            frgmnt1[prop[1]] = values[0]
                        }
                    }
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