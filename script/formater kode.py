import csv
import os
import re

PATH = os.path.dirname(__file__)
if PATH != "":
    os.chdir(PATH)

linjer = []

with open("raa kode.csv", mode = 'r', encoding="UTF8") as fil:

    csvFil = csv.reader(fil)

    for linje in csvFil:
        if linje == []:
            linje.append(" ")
        tekst = ''

        for i in range(len(linje)):
            tekst += linje[i]
            if i != len(linje)-1:
                tekst += "," 
        
        linjer.append(tekst)

metfun = ["dirname","chdir","len","append","zeros","append","add","compile","fit","predict","argmax","print","save","listdir","imread","resize","GaussianBlur","reshape","array"]

variables = ["path","PATH","__file__","data","file_inputs","fil","bilde_array","bilde","model","outputs","outnums","output","out","sum_riktig","in_out","name","prediction","train_x","train_y","test_x","test_y","y_table","y","use","i","sannhet","element","temp","acc_sum","prediction_n","acc"]

classes = ["tensorflow","tf","Dense","Activation","Sequential","Adam","numpy","np","os","keras","range","list","cv2","int","zip","tuple"]

operators = ["import","as","from","for","in","if","elif","else","and","or"]

for w in range(len(linjer)):
    words = linjer[w]
    if "\xa0" in linjer[w]:
        words = linjer[w].replace('\xa0','<span class="tab">##</span>')
    words = re.split('(?=[ .,\)\(\[\]:\{\}]"=)|(?<=[ .,\)\(\[\]:\{\}]"=)',words)
    newset = ""
    print(words)
    for k in range(len(words)):
        if words[k] in metfun:
            words[k] = '<span class="metfun">' + words[k] + '</span>'
        elif words[k] in variables:
            words[k] = '<span class="variabel">' + words[k] + '</span>'
        elif words[k] in classes:
            words[k] = '<span class="klasse">' + words[k] + '</span>'
        elif words[k] in operators:
            words[k] = '<span class="operator">' + words[k] + '</span>'
        newset += words[k]
    linjer[w] =  ['<li>'+newset+'</li>']

with open("formatert kode.csv", mode="w", newline='',encoding="UTF8") as fil:
    writer = csv.writer(fil)

    for linje in linjer:
        writer.writerow(linje)
        