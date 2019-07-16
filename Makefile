MOCHA=mocha --exit
CONSTRUCTIONS_PATH=test/services/groups.test.js
CLASSES_PATH=test/services/classes.test.js
USERS_PATH=test/services/users.test.js
GROUPS_PATH=test/services/groups.test.js

test:
	$(MOCHA) $(CLASSES_PATH) -g "classes management by teacher" &&\
	$(MOCHA) $(GROUPS_PATH) -g "groups management by teacher" &&\
	$(MOCHA) $(GROUPS_PATH) -g "groups management by student" &&\
	$(MOCHA) $(CONSTRUCTIONS_PATH) -g "user" &&\
	$(MOCHA) $(USERS_PATH) -g "users service" &&\
	$(MOCHA) $(USERS_PATH) -g "teacher end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "unathenticated user end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "student end to end tests"
