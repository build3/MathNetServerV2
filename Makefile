MOCHA=mocha --exit
USERS_PATH=test/services/users.test.js

test:
	$(MOCHA) $(USERS_PATH) -g "users service" &&\
	$(MOCHA) $(USERS_PATH) -g "teacher end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "unathenticated user end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "student end to end tests"
