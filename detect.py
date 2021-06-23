 #!/usr/bin/env python
 
from tensorflow.keras.applications.vgg16 import VGG16
import os 
import zipfile 
import tensorflow as tf 
from tensorflow.keras.preprocessing.image import ImageDataGenerator 
from tensorflow.keras import layers 
from tensorflow.keras import Model 
import matplotlib.pyplot as plt
import numpy as np
# https://www.analyticsvidhya.com/blog/2020/08/top-4-pre-trained-models-for-image-classification-with-python-code/

import sys
import json

def main():
    # accept multiple '--param's
    params_list = json.loads(sys.argv) # the 0 index is the name of the python file that's why here we have index 1 and no index brings the whole list of parameters passed with the first item in that list being the name of our python file

    local_zip = '/tmp/cats_and_dogs_filtered.zip'
    zip_ref = zipfile.ZipFile(local_zip, 'r')
    zip_ref.extractall('/tmp')
    zip_ref.close()

    base_dir = '/tmp/cats_and_dogs_filtered'
    train_dir = os.path.join(base_dir, 'train')
    validation_dir = os.path.join(base_dir, 'validation')

    # Directory with our training cat pictures
    train_cats_dir = os.path.join(train_dir, 'cats')

    # Directory with our training dog pictures
    train_dogs_dir = os.path.join(train_dir, 'dogs')

    # Directory with our validation cat pictures
    validation_cats_dir = os.path.join(validation_dir, 'cats')

    # Directory with our validation dog pictures
    validation_dogs_dir = os.path.join(validation_dir, 'dogs')

    # Add our data-augmentation parameters to ImageDataGenerator
    train_datagen = ImageDataGenerator(rescale = 1./255.,rotation_range = 40, width_shift_range = 0.2, height_shift_range = 0.2, shear_range = 0.2, zoom_range = 0.2, horizontal_flip = True)

    # Note that the validation data should not be augmented!
    test_datagen = ImageDataGenerator( rescale = 1.0/255. )

    # Flow training images in batches of 20 using train_datagen generator
    train_generator = train_datagen.flow_from_directory(train_dir, batch_size = 20, class_mode = 'binary', target_size = (224, 224))

    # Flow validation images in batches of 20 using test_datagen generator
    validation_generator = test_datagen.flow_from_directory( validation_dir,  batch_size = 20, class_mode = 'binary', target_size = (224, 224))

    # We will be using only the basic models, with changes made only to the final layer.
    # This is because this is just a binary classification problem while these models are built to handle up to 1000 classes.

    base_model = VGG16(input_shape = (224, 224, 3), # Shape of our images
    include_top = False, # Leave out the last fully connected layer
    weights = 'imagenet')

    # Since we don’t have to train all the layers, we make them non_trainable:
    for layer in base_model.layers:
        layer.trainable = False

    # Compile and fit !

    # Flatten the output layer to 1 dimension
    x = layers.Flatten()(base_model.output)

    # Add a fully connected layer with 512 hidden units and ReLU activation
    x = layers.Dense(512, activation='relu')(x)

    # Add a dropout rate of 0.5
    x = layers.Dropout(0.5)(x)

    # Add a final sigmoid layer for classification
    x = layers.Dense(1, activation='sigmoid')(x)

    model = tf.keras.models.Model(base_model.input, x)

    model.compile(optimizer = tf.keras.optimizers.RMSprop(lr=0.0001), loss = 'binary_crossentropy',metrics = ['acc'])


    vgghist = model.fit(train_generator, validation_data = validation_generator, steps_per_epoch = 100, epochs = 10)

    out1 = model.predict(params_list[1])
    out2 = model.predict(params_list[2])
    out3 = model.predict(params_list[3])
    out4 = model.predict(params_list[4])

    #here we can send to minio after we import it here and in docker the minio client only 

    # output result of this action
    print(json.dumps({ 'predictions' : [np.argmax(out1), np.argmax(out2), np.argmax(out3), np.argmax(out4)]})) 
    return json.dumps({ 'predictions' : [np.argmax(out1), np.argmax(out2), np.argmax(out3), np.argmax(out4)]})

# protects users from accidentally invoking the script when they didn't intend to.
# https://stackoverflow.com/questions/419163/what-does-if-name-main-do

if __name__ == "__main__":
    main()























