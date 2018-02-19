VERSION := test-$(shell git describe --always --long)-$(shell date +%s)

test-deploy:
	docker build -t justinbarrick/plexbot:$(VERSION) .
	docker push justinbarrick/plexbot:$(VERSION)
	helm upgrade --install --wait plexbot ./helm --set image.tag=$(VERSION)
