MOCHA=mocha --exit
CONSTRUCTIONS_PATH=test/services/groups.test.js
CLASSES_PATH=test/services/classes.test.js
USERS_PATH=test/services/users.test.js
GROUPS_PATH=test/services/groups.test.js

test-user:
	$(MOCHA) $(USERS_PATH) -g "users service" &&\
	$(MOCHA) $(USERS_PATH) -g "teacher end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "unathenticated user end to end tests" &&\
	$(MOCHA) $(USERS_PATH) -g "student end to end tests"

test-construction:
	$(MOCHA) $(CONSTRUCTIONS_PATH) -g "user"

test-class:
	$(MOCHA) $(CLASSES_PATH) -g "Application's class management"

test-groups:
	 $(MOCHA) $(GROUPS_PATH) -g "groups management by teacher" &&\
	 $(MOCHA) $(GROUPS_PATH) -g "groups management by student" &&\

test:
	@$(MAKE) test-user &&\
	@$(MAKE) test-construction &&\
	@$(MAKE) test-class &&\
	@$(MAKE) test-groups
