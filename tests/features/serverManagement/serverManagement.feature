@serverManagement
Feature: Server Management

  @startServer
  Scenario: Starting the server
    Given the server is not running
    When I start the server on port 3000
    Then the server should be running on port 3000

  @startRoute
  Scenario: Route successfully initialized
    Given the server is not running
    When the order queue route started
    Then the route should execute correctly

  @stopServer
  Scenario: Stopping the server
    Given the server is running
    When I stop the server
    Then the server should not be running

  @errorWhenStopServer
  Scenario: Encountering an error while closing the server
    Given the ExpressAdapter server is running
    When I close the ExpressAdapter server and an error occurs
    Then an error should be thrown