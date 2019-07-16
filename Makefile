MOCHA=mocha --exit
USERS_PATH=test/services/users.test.js

APP=test/app.test.js
WORKSHOPS=test/services/workshops.test.js
CHANNELS=test/channels.test.js

test-app:
	$(MOCHA) $(APP)

test-workshops:
	$(MOCHA) $(WORKSHOPS)

test-channels:
	$(MOCHA) $(CHANNELS)

test:
	@$(MAKE) test-app
	@$(MAKE) test-channels
	$(MOCHA) $(USERS_PATH) -g "users service" &&\
	$(MOCHA) $(USERS_PATH) -g "teacher end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "unathenticated user end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "student end to end tests"
