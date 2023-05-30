describe("newtube front end", () => {

    it("can list videos", () => {

        // Create a sample user
        cy.request("POST", "/signup", {
            email: "sampleuser@example.com",
            password: "password123"
        });

        // Log in as the sample user
        cy.request("POST", "/login", {
            email: "sampleuser",
            password: "password123"
        }).then((response) => {
            const { token } = response.body;
            // Save the token for subsequent requests
            Cypress.env("token", token);
        });

        cy.visit("/landing");
        // Load the fixture named "two-videos" into the database "metadata".
        cy.loadFixture("metadata", "two-videos");
        
        // Check that we have two items in the video list.
        cy.get("#video-list").find("div").should("have.length", 2);

        cy.get("#video-list div:nth-child(1) a") // Check the first item in the video list.
            .should("have.text", "SampleVideo_1280x720_1mb.mp4") // Make sure file name is correct.
            .should("have.attr", "href", "/video?id=5ea234a1c34230004592eb32"); // Make sure link is correct.

        cy.get("#video-list div:nth-child(2) a") // Check the second item in the video list.
            .should("have.text", "Another video.mp4") // Make sure file name is correct.
            .should("have.attr", "href", "/video?id=5ea234a5c34230004592eb33"); // Make sure link is correct.
    });
});
