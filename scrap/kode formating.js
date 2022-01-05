let lister = document.getElementsByClassName("kode");
let segments = [];
let lines = [];

let rows = []

let metfun = ["dirname","chdir","len","append","zeros","append","add","compile","fit","predict","argmax","print","save","listdir","imread","resize","GaussianBlur"];

let variables = ["path","PATH","__file__","data","file_inputs","fil","bilde_array","bilde","model","outputs","outnums","output","out","sum_riktig","in_out","name","prediction","train_x","train_y","test_x","test_y","y_table","y","use","i","sannhet","element","temp","acc_sum","prediction_n","acc"];

let classes = ["tf","Dense","Activation","Sequential","Adam","numpy","np","os","keras","range","list","cv2","int","zip","tuple"];

let operators = ["import","as","from","for","in","if","elif","else","and","or"];

let words = [];
for(let i = 0; i < lister.length; i++)
{
    lines = lister[i].innerText.split("\n");
    for(let j = 0; j < lines.length; j++)
    {
        if(lines[j].includes("####"))
        {
            lines[j] = lines[j].replace("#"," ")
        }
        if(lines[j].includes(" "))
        {
            words = lines[j].split(/(?=[ .,\)\(\[\]:\{\}])|(?<=[ .,\)\(\[\]:\{\}])/g);
        } else {
            words = lines[j];
        };
        let set = "";
        for(let k = 0; k < words.length; k++)
        {
            for(let x = 0; x < words[k].length;){
            if(variables.includes(words[k][x])){
                words[k] = '<span class="variabel">' + words[k][x] + '</span>';
            }
            else if(metfun.includes(words[k][x])){
                words[k] = '<span class="metfun">' + words[k][x] + '</span>';
            }
            else if(classes.includes(words[k][x])){
                words[k] = '<span class="klasse">' + words[k][x] + '</span>';
            } 
            else if(operators.includes(words[k][x])){
                words[k] = '<span class="operator">' + words[k][x] + '</span>';
            };};
            set += words[k]
        };
        lines[j] = "<li>"+set+"</li>";
    };
   
    lister[i].innerHTML = lines 
};
