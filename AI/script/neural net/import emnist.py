import tensorflow as tf
import numpy as np
import os
import cv2

PATH = os.path.dirname(__file__)
os.chdir(PATH)

"""formater bilder"""

data = []
file_inputs = os.listdir(PATH+"/inputs")
print(file_inputs)
for fil in file_inputs:
    bilde_array = cv2.imread("inputs/"+fil, cv2.IMREAD_GRAYSCALE)
    bilde = cv2.resize(bilde_array, (28,28))
    bilde = cv2.GaussianBlur(bilde, ksize = (3,3), sigmaX=34, sigmaY=36)
    bilde = bilde.reshape(784)
    bilde = (255-bilde)
    data.append(bilde)

data = np.array(data)

"""prøv og forstå hva det er bilde av"""
model = tf.keras.models.load_model(PATH+"/modeller/min_model")
outputs = model.predict(data, batch_size = 2)

"""skriv ut svarene"""

outnums = []
for output in outputs:
    print(output)
    out = np.argmax(output)
    outnums.append(out)

sum_riktig = 0
in_out = zip(tuple(file_inputs), tuple(outnums))
for name, prediction in in_out:
    print(f"{name} er sifferet {prediction}")
    if int(name[0]) == prediction:
        sum_riktig += 1

print(f"{sum_riktig/len(outnums)*100}%")