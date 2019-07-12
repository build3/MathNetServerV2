MOCHA=mocha --exit
USERS_PATH=test/services/users.test.js
GROUPS_PATH=test/services/groups.test.js

test:
	$(MOCHA) $(GROUPS_PATH) -g "groups management by student" &&\
	$(MOCHA) $(GROUPS_PATH) -g "groups management by unauthorized user" &&\
	$(MOCHA) $(USERS_PATH) -g "users service" &&\
	$(MOCHA) $(USERS_PATH) -g "teacher end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "unathenticated user end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "student end to end tests"
