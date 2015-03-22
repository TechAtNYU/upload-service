### Simple upload image

Running:

- `sudo npm install`
- `export RackUN=__`, `export RackAPI=__`, `export RackContainer=__`
- `node index.js`
- `http://localhost:8080`

To do:

- ~~~Store the images in a single directory~~~
- ~~~Random number / generation of numbers for images.~~~
- ~~~Return a URL for the image~~~
- ~~~Store the images on Rackspace Cloud Files~~~

Simple form:

Exists on `http://localhost:8080/simple-form`

```
<form action="/upload" method="post">
	<input name="upload" type="file" />
	<input type="submit" value="Upload" />
</form>
```

OR

Through the command-line (Simple way to submit an image through the command-line):

```bash
curl -X POST -F upload=@(IMAGE_PATH_HERE) localhost:8080/upload
```

Google Code:

`gjslint -r index.js`
`fixjsstyle index.js`