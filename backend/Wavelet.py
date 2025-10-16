import cv2
import numpy as np
import pywt

def w2D(img, mode="haar", level=1):
    # Convert to grayscale
    imArray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    imArray = np.float32(imArray) / 255.0  # Normalize to [0,1]

    # Compute wavelet coefficients
    coeffs = pywt.wavedec2(imArray, mode, level=level)

    # Zero out approximation coefficients
    coeffs_H = list(coeffs)
    coeffs_H[0] *= 0

    # Reconstruct image from modified coefficients
    imArray_H = pywt.waverec2(coeffs_H, mode)
    imArray_H = np.uint8(imArray_H * 255)  # Convert back to uint8

    return imArray_H
