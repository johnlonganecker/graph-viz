build:
	docker build -t graph-viz .

run:
	docker run -p 6789:6789 -p 7890:7890 -it --rm -v $(PWD)/graph-data:/home/node/app/graph-data graph-viz
