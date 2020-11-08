# Lazy loading

## What is it
Lazy loading for images, it's using IntersectionObserver or a native browser implementation (if available). Supports an image and a picture tag

## Installation
```
yarn add @lightsource/lazy-loading
```
OR
```
npm install @lightsource/lazy-loading
```

## Example of usage

#### Html structure

An image

```
<img class='lazy-loading' <!-- setup a class, the class name can be changed through code -->
     src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" <!-- default stub -->
     data-src="example.com/picture" <!-- real source -->
     alt="Some description"
     data-srcset="example.com/picture 500w, example.com/picture2 1000w" <!-- optional -->
     loading="lazy"> <!--optional, also will paste this attribute automatic if a browser supports -->
```

OR

A picture

```
<picture>

 <source data-srcset="example.com/picture" <!-- real source -->
         type="image/jpg"> <!-- image's mime type -->

<img class='lazy-loading' <!-- setup a class, the class name can be changed through code -->
     src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" <!-- default stub -->
     data-src="example.com/picture" <!-- real source -->
     alt="Some description"
     loading="lazy"> <!--optional, also will paste this attribute automatic if a browser supports -->

</picture>
```

#### Js

```
import lazyLoading from '@lightsource/lazy-loading';

lazyLoading.settings.ERROR_CALLBACK = (info) => {
    // TODO console.log or something else
    console.log('lazy loading error', info);
}

// optional, the default class is 'lazy-loading'
lazyLoading.setClass('custom-lazy', 'custom-lazy--loaded');
```
