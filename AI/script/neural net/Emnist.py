"""imports"""

import tensorflow as tf
from tensorflow.keras.layers import Dense, Activation
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam
import numpy as np
import os

PATH = os.path.dirname(__file__)
os.chdir(PATH)


"""retrive data"""

(train_x, train_y),(test_x, test_y) = tf.keras.datasets.mnist.load_data()

"""format data"""

train_x = train_x.reshape(-1,784)
test_x = test_x.reshape(-1,784)

y_table= []
for y in [train_y,test_y]:
    y = list(y)
    use = []
    for i in range(len(y)):
        use.append((y[i],i))
    for sannhet, element in use:
        temp = np.zeros(shape=(10,))
        temp[sannhet] = 1
        y[element] = temp
    y_table.append(np.array(y))

train_y = y_table[0]
test_y = y_table[1]

"""lag model"""

model = Sequential()
model.add(Dense(256,input_shape = (784,)))
model.add(Activation("tanh"))

model.add(Dense(128))
model.add(Activation("tanh"))

model.add(Dense(64))
model.add(Activation("tanh"))

model.add(Dense(10))
model.add(Activation("softmax"))

model.compile(loss="categorical_crossentropy", optimizer = Adam(learning_rate=1e-3), metrics=["accuracy"])

"""tren modell"""
model.fit(train_x, train_y,batch_size=64, epochs=10,validation_split=0.1)

"""sjekk riktighet"""

predictions = model.predict(test_x, batch_size=32)

acc_sum = 0
prediction_n = len(predictions)
for i in range(prediction_n):
    prediction = np.argmax(predictions[i])
    if prediction == np.argmax(test_y[i]):
        acc_sum += 1

acc = (acc_sum/prediction_n)*100

print(f"accuracy is {acc}%")

model.save(PATH+"/modeller/min_model")