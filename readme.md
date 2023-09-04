# Table of Contents.
> # 1. Introduction
>> ## *1.1* Purpose
>> A bug tracker is an essential tool for any software development team, as it helps document the life cycle of any bugs that are encountered throughout the development process. With a bug tracker, teams can detect, track, and monitor any bugs, defects, or other issues that arise, and then work to eliminate them.
>
>> ## *1.2* Scope
>> &nbsp;  *In Scope* <br>
>> &nbsp;  &nbsp; *1.* User Management: includes user registration, login, and profile management. <br>
>> &nbsp;  &nbsp; *2.* Bug Tracking: Enables users to report bugs, track progress, and prioritise bug reports. <br>
>> &nbsp;  &nbsp; *3.* Reporting: Generates reports on bugs, bug fixing progress, and user activity. <br>
>> &nbsp;  *Out Scope* <br>
>> &nbsp;  &nbsp;  *1.* Integration with other project management tools. <br>
>> &nbsp;  &nbsp;  *2.* Mobile app development for the bug tracking system. <br>
>> &nbsp;  &nbsp;  *3.* Automatic bug detection and fixing. <br>
>
>> ## *1.3* Objectives
>> &nbsp; &nbsp; *1.* To provide a user-friendly interface for reporting and tracking bugs. <br>
>> &nbsp; &nbsp; *2.* To streamline the bug fixing process and reduce the time taken to fix bugs. <br>
>> &nbsp; &nbsp; *3.* To prioritize bug reports based on severity and impact.<br>
>> &nbsp; &nbsp; *4.* To provide real-time updates on bug fixing progress to stakeholders. <br>
>> &nbsp; &nbsp; *5.* To generate reports on bugs, bug fixing progress, and user activity for better transparency and accountability. <br>
>
>> ## *1.4* Overview
>> Bug tracking is an exciting process of discovering and fixing errors in software! It's like a thrilling treasure hunt where developers are on a mission to uncover and remove any pesky bugs. Finding errors in complex software systems can be challenging, but it's also incredibly rewarding to see a project come to life after all the bugs have been eliminated. With the right bug tracking tools, teams can ensure that software is working as intended to provide a seamless user experience.
>
>> ## *1.5* Visual Diagram Overview
>> [![PDF Diagram](./client/public/img-vid/intro-Dia001.png)](./client/public/img-vid/intro-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/account-Dia002.png)](./client/public/img-vid/account-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/admin-Dia003.png)](./client/public/img-vid/admin-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/tester-Dia004.png)](./client/public/img-vid/tester-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/manager-Dia005.png)](./client/public/img-vid/manager-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/developer-Dia006.png)](./client/public/img-vid/developer-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/customer-Dia007.png)](./client/public/img-vid/customer-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/status-Dia008.png)](./client/public/img-vid/status-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/tags&ids-Dia009.png)](./client/public/img-vid/tags&ids-Diagram.pdf)
>> [![PDF Account](./client/public/img-vid/figma.001.png)](./client/public/img-vid/figma.pdf)
>
>> ## *1.6* Visual UI Overview
>> *insert Figma video here in 5 tables of stages in Minimum Varible Product.


> # 2. System Features
>> ## *2.1* User Management
>> - - - -
>> 
>>> ### *2.1.1* User Registration
>>> - [ ] &nbsp; &nbsp; *1.* Users should be able to register for the bug tracking system using their email address and password. <br>
>>> - [ ] &nbsp; &nbsp; *2.* Users should be able to provide their personal information such as name, company name, and job title during registration. <br>
>>> - [ ] &nbsp; &nbsp;  *3.* The system should validate the email address before allowing users to complete the registration process. <br>
>>> - [ ] &nbsp; &nbsp;  *4.* The system should send a confirmation email to users after successful registration. <br>
>>
>>> ### *2.1.2* User Login
>>> - [ ] &nbsp; &nbsp; *1.* Users should be able to log in to the bug tracking system using their email address and password.<br>
>>> - [ ] &nbsp; &nbsp; *2.* The system should provide an option for users to reset their password if they forget it.<br>
>>> - [ ] &nbsp; &nbsp; *3.* The system should use secure encrypted connections (e.g. SSL/TLS) for user login.<br>
>>
>>> ### *2.1.3* Profile Management
>>> - [ ] &nbsp; &nbsp; *1.*  Users should be able to view and edit their personal information and preferences.<br>
>>> - [ ] &nbsp; &nbsp; *2.*  Users should be able to change their password.<br>
>>> - [ ] &nbsp; &nbsp; *3.*  The system should allow administrators to manage user accounts, including enabling and disabling user accounts.<br>
>> 
>> ## *2.2* Content Management
>> - - - - 
>>> ### *2.2.1* Bug Report Management
>>> - [ ] &nbsp; &nbsp; *1.* Users should be able to create, view, edit, and delete bug reports.<br>
>>> - [ ] &nbsp; &nbsp; *2.* Bug reports should include a title, description, and attachments such as screenshots or log files.<br>
>>> - [ ] &nbsp; &nbsp; *3.* Users should be able to assign severity levels to bug reports.<br>
>>> - [ ] &nbsp; &nbsp; *4.* Users should be able to categorize bug reports by type, such as UI bugs, functionality bugs, performance bugs, etc.<br>
>>> - [ ] &nbsp; &nbsp; *5.* Users should be able to assign bug reports to developers for resolution.<br>
>>> - [ ] &nbsp; &nbsp; *6.* The system should provide a search function for finding specific bug reports.<br>
>>
>>> ### *2.2.2* Comment Management
>>> - [ ] &nbsp; &nbsp; *1.* Users should be able to add comments to bug reports for better collaboration and communication.<br>
>>> - [ ] &nbsp; &nbsp; *2.* Users should be able to edit and delete their own comments.<br>
>>> - [ ] &nbsp; &nbsp; *3.* The system should provide a notification system for users when a new comment is added to a bug report they are following.<br>
>>
>>> ### *2.2.3* Activity Log
>>> - [ ] &nbsp; &nbsp; *1.* The system should log all activities, such as bug report creation, updates, and deletions, for auditing and accountability purposes.<br>
>>> - [ ] &nbsp; &nbsp; *2.* The system should provide a search function for finding specific activities in the log.<br>
>>
>> ## *2.3* Media Management
>> - - - - 
>>> ### *2.3.1* Image Management
>>> - [ ] &nbsp; &nbsp; *1.* Users should be able to attach images to bug reports for better visualization and understanding of the bug.<br>
>>> - [ ] &nbsp; &nbsp; *2.* The system should automatically resize images to a suitable size for faster loading and to save storage space.<br>
>>> - [ ] &nbsp; &nbsp; *3.* The system should provide a preview function for users to view images before attaching them to bug reports.<br>
>>
>>> ### *2.3.2* Video Management
>>> - [ ] &nbsp; &nbsp; *1.* Users should be able to attach videos to bug reports for better visualization and understanding of the bug.<br>
>>> - [ ] &nbsp; &nbsp; *2.* The system should automatically compress videos to a suitable size for faster loading and to save storage space.<br>
>>> - [ ] &nbsp; &nbsp; *3.* The system should provide a preview function for users to view videos before attaching them to bug reports.<br>
>>

> # 3. System Design
>> ## *3.1* Architecture Diagram
>> - - - -
>>> ### *3.1.1* System Architecture
>>> - [ ] &nbsp; &nbsp; *1.* The bug tracking system should consist of a front-end user interface, a back-end database, and an API for communication between the two.<br>
>>> - [ ] &nbsp; &nbsp; *2.* The front-end user interface should be developed using HTML, CSS, and JavaScript.<br>
>>> - [ ] &nbsp; &nbsp; *3.* The back-end database should be developed using MySQL or a similar database management system.<br>
>>> - [ ] &nbsp; &nbsp; *4.* The API should be developed using RESTful API design principles.<br>
>>
>>> ### *3.1.2* Component Diagram
>>> - [ ] &nbsp; &nbsp; *1.* The bug tracking system should consist of the following components:<br>
>>>     - [ ] - Login page <br>
>>>     - [ ] - Dashboard <br>
>>>     - [ ] - Bug report management page <br>
>>>     - [ ] - Comment management page <br>
>>>     - [ ] - Activity log page <br>
>>>     - [ ] - User management page <br>
>>>     - [ ] - Media management page <br>
>>> - [ ] &nbsp; &nbsp; *2.* The components should interact with each other through the API.<br>
>>> - [ ] &nbsp; &nbsp; *3.* The components should be designed to be modular and scalable for future updates and expansions.<br>
>>
>>> ### *3.1.3* Contraints Diagram
>>> Required fields for the bug report. <br>
>>> Note that the required fields of the bug report are: <br> 
>>>  &nbsp;  &nbsp;  **Bug Summary**,  <br>
>>>  &nbsp;  &nbsp;  **Severity**,  <br>
>>>  &nbsp;  &nbsp;  **Steps to reproduce**,  <br>
>>>  &nbsp;  &nbsp;  **Actual Result**,<br>
>>>  &nbsp;  &nbsp;  **Expected Result**.<br>
>>
>> ## *3.2* Database Design
>> - - - -
>>> ### *3.2.1* Database Structure
>>> - [ ] &nbsp; &nbsp; *1.* The bug tracking system should use a relational database management system (RDBMS) such as MySQL.
>>> - [ ] &nbsp; &nbsp; *2.* The database should consist of the following tables:
>>>     - [ ] - Users
>>>     - [ ] - Bugs
>>>     - [ ] - Comments
>>>     - [ ] - Media
>>>     - [ ] - Activity Log
>>> - [ ] &nbsp; &nbsp; *3.* The tables should be designed to be modular and scalable for future updates and expansions.
>>
>>> ### *3.2.2* Tables and Fields
>>>
>>> <details>
>>> <summary> 1. User Table </summary>
>>>
>>>
>>> ### User Table
>>>
>>> | Field Name | Description |
>>> |------------|-------------|
>>> | `id`       | Primary key |
>>> | `name`     |             |
>>> | `email`    |             |
>>> | `password` |             |
>>> | `role`     | Options: `administrator`, `developer`, `tester` |
>>> | `created_at` |  |
>>> | `updated_at` |  |
>>>
>>> </details>
>>>
>>> <details>
>>> <summary> 2. Bugs Table </summary>
>>>
>>>
>>> ### Bugs Table
>>>
>>> | Field Name | Description |
>>> |------------|-------------|
>>> | `id`       | Primary key |
>>> | `title`     |             |
>>> | `description`    |             |
>>> | `status` | Options: `open`, `closed`, `in progress` |
>>> | `assigned_to`     | `foreign key referencing the User table` |
>>> | `created_at` |  |
>>> | `updated_at` |  |
>>>
>>> </details>
>>> 
>>> <details>
>>> <summary> 3. Comments Table </summary>
>>>
>>>
>>> ### Comments Table
>>>
>>> | Field Name | Description |
>>> |------------|-------------|
>>> | `id`       | Primary key |
>>> | `bug_id`     | `foreign key referencing the Bugs table` |
>>> | `user_id`    |  `foreign key referencing the Users table` |
>>> | `comment` |  |
>>> | `assigned_to` |  |
>>> | `created_at` |  |
>>> | `updated_at` |  |
>>>
>>> </details>
>>> 
>>> <details>
>>> <summary> 4. Media Table </summary>
>>>
>>>
>>> ### Media Table
>>>
>>> | Field Name | Description |
>>> |------------|-------------|
>>> | `id`       | Primary key |
>>> | `bug_id`     | `foreign key referencing the Bugs table` |
>>> | `type`    |  Options: `image`, `video` |
>>> | `file_name` |  |
>>> | `file_path` |  |
>>> | `created_at` |  |
>>> | `updated_at` |  |
>>>
>>> </details>
>>> 
>>> <details>
>>> <summary> 5. Activity Log Table </summary>
>>>
>>>
>>> ### Activity Log Table
>>>
>>> | Field Name | Description |
>>> |------------|-------------|
>>> | `id`       | Primary key |
>>> | `bug_id`     | `foreign key referencing the Bugs table` |
>>> | `user_id`    |  `foreign key referencing the Users table` |
>>> | `action` | Options: `Create`, `Update`, `Delete` |
>>> | `assigned_to` |  |
>>> | `created_at` |  |
>>>
>>> </details>
>>> <br>
> # 4. Technical Requirements
>> ## *4.1* Technology Stack
>> - - - -
>>> #### The bug tracking system will be developed using the following technologies: 
>>> ### *4.1.1* Front-end:
>>> - HTML 
>>> - CSS 
>>> - JavaScript 
>>> - React.js
>>
>>> ### *4.1.2* Back-end:
>>> - Node.js 
>>> - Express.js
>>
>>> ### *4.1.3* Database:
>>> - MySQL
>>> - MongoDB.js
>>
>>> ### *4.1.4* Testing:
>>> - Jest 
>>> - Mocha
>>
>>> ### *4.1.5* Deploymemnt:
>>> - Heroku
>>
>>> #### The system should be built using modular, scalable, and maintainable code to ensure the best performance and ease of development.
>>> #### The system should be compatible with modern web browsers and mobile devices.
>>><br>
>> ## *4.2* Compatibility Requirements
>> - - - -
>>> ### *4.2.1* The bug tracking system must be compatible with the following operating systems:
>>> - Windows 10
>>> - MacOS 10.14 or later
>>> - Ubuntu 20.04 or later
>>
>>> ### *4.2.2* The system must support the latest versions of the following web browsers:
>>> - Google Chrome
>>> - Mozilla Firefox
>>> - Apple Safari
>>> - Microsoft Edge
>>
>>> ### *4.2.3* The system must be accessible on both desktop and mobile devices, with responsive design.
>>
>>> ### *4.2.4* The system should have minimum hardware requirements:
>>> - 4GB RAM
>>> - Dual-core processor
>>> - 500MB hard drive
>>><br>
>> ## 4.3 Security Requirements
>>> *1.* The bug tracking system must use secure encryption for data transmission and storage.<br>
>>> *2.* User authentication and authorization must be implemented to restrict access to the system to authorized users only.<br>
>>> *3.* Passwords must be encrypted and securely stored in the database.<br>
>>> *4.* The system must implement measures to prevent hacking, such as regular security audits and vulnerability scans.<br>
>>> *5.* The system must have a disaster recovery plan in place in the event of a security breach.<br>
>>> *6.* The system must comply with relevant data protection and privacy regulations, such as GDPR.<br>
>>>

> # 5. Non-Function Requirements
>> ## *5.1* Performance Requirements
>> - - - -
>>> ### *5.1.1* Response Time 
>>> &nbsp; *1.* The bug tracking system must have a response time of less than 2 seconds for all user actions. <br>
>>> &nbsp; *2.* The system must be able to search and retrieve bug reports in less than 5 seconds.<br>
>>> &nbsp; *3.* The system must be able to generate reports and statistics in real-time.<br>
>>
>>> ### *5.1.2* Load Time 
>>> &nbsp; *1.* The system must be able to process and store a minimum of 1000 bug reports per day.<br>
>>> &nbsp; *2.* The system must have a 99.9% uptime guarantee.<br>
>>
>> ## 5.2 Security Requirements
>> - - - -
>>> ### 5.2.1 Data Protection
>>> *1.* The bug tracking system must securely store all user data and sensitive information.<br>
>>> *2.* The system must use encryption to protect data both in transit and at rest.<br>
>>> *3.* The system must allow users to control access to their own data, including the ability to delete it.<br>
>>
>>> ### 5.2.2 Threat Prevention
>>> *1.* The bug tracking system must have mechanisms in place to detect and prevent unauthorized access attempts.<br>
>>> *2.* The system must have robust input validation to prevent SQL injection and other common attacks.<br>
>>> *3.* The system must regularly perform security audits and update its security measures as needed.<br>
>>
>> ## 5.3 Usability Requirements
>> - - - -
>>> ### 5.3.1 User Experience
>>> *1.* The user interface of the bug tracking system must be intuitive and easy to use.<br>
>>> *2.* The system must provide clear and concise feedback to users on all actions.<br>
>>> *3.* The system must support a range of user roles, including reporters, developers, and managers.<br>
>>
>>> ### 5.3.2 Accessibility
>>> *1.* The bug tracking system must comply with accessibility standards, such as WCAG 2.0.<br>
>>> *2.* The system must be fully functional for users with disabilities, including keyboard-only navigation.<br>
>>> *3.* The system must have adjustable text sizes and high-contrast options for visually impaired users.<br>
>>

>> ## *4.2* Appendices and Credits
>> - - - -
>>> SRS - https://www.youtube.com/watch?v=rhXfrscZ_tM <br> 
>>> MVP - https://blackboxofpm.com/mvpm-minimum-viable-product-manager-e1aeb8dd421 <br> 
>>