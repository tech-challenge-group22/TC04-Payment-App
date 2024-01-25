@invalidRouteFeature
Feature: Handling invalid HTTP methods in ExpressAdapter

  Scenario: Attempt to register a route with an invalid HTTP method
    Given I have an instance of ExpressAdapter
    When I try to register a route with an invalid HTTP method "invalidMethod" to "/test"
    Then I should receive an error "Invalid method: invalidMethod"