// const classes = [
//     "Base"
//     ,"BaseVariant"
//     ,"WorkZone"
//     ,"Size"
//     ,"Position"
// ];

// // var loader = 0;

// classes.forEach(c => document.head.appendChild(
//     (() => {
//         const script = document.createElement("script"); 
//         script.src = `js/Classes/${c}.js`;
//         return script;
//     })()
// ));
requirejs(['js/Classes/Base'], function(d){
    console.log(new Base());
});

console.log()