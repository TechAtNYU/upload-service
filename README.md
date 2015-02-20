### Simple upload image

Running:

- `sudo npm install`
- `mkdir uploads`
- `node index.js`
- `http://localhost:8080`

To do:

- ~~~Store the images in a single directory~~~
- ~~~Random number / generation of numbers for images.~~~
- ~~~Return a URL for the image~~~

Simple form:

Exists on `http://localhost:8080/simple-form`

```
<form action="/upload" enctype="multipart/form-data" method="post">
	<input multiple="multiple" name="upload" type="file" />
	<input type="submit" value="Upload" />
</form>
```

OR

Through the command-line:

```bash
curl -X POST -F upload=@(IMAGE_PATH_HERE) services.tnyu.org/upload
```