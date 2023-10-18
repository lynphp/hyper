window.mouse=(()=>{
    let config = {
        name:'mouse',
    }
    let actions = {
        fetch:(elem)=>{
            alert(elem)
        },
    }
    return {
        getName: () => {
            return config.name
        },
        init: () => {
            for(const action in actions){
                mouse[action]=actions[action]
            }
        },
        dependencyAdded: (dependency) => {
        },
        handle: (frgmnt) => {

        }
    }
})()