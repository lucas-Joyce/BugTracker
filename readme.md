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
>>> - [ ] <details> <summary> *1.* Users Table </summary> <p> 
>>>     - id (primary key)<br>
>>>     - name<br>
>>>     - email<br>
>>>     - password<br>
>>>     - role (administrator, developer, tester)<br>
>>>     - created_at<br>
>>>     - updated_at<br>
>>>     </p>
>>>     </details>
>>>
>>> - [ ] &nbsp; &nbsp; *2.* Bugs Table <details> <p>
>>>     - id (primary key)<br>
>>>     - title<br>
>>>     - description<br>
>>>     - status (open, closed, in progress)<br>
>>>     - assigned_to (foreign key referencing the Users table)<br>
>>>     - created_at<br>
>>>     - updated_at<br>
>>>     </p>
>>>     </details>
>>> 
>>> - [ ] &nbsp; &nbsp; *3.* Comments Table <details> <p> 
>>>     - id (primary key)<br>
>>>     - bug_id (foreign key referencing the Bugs table)<br>
>>>     - user_id (foreign key referencing the Users table)<br>
>>>     - comment<br>
>>>     - created_at<br>
>>>     - updated_at<br>
>>>     </p>
>>>     </details>
>>>
>>> - [ ] &nbsp; &nbsp; *4.* Media Table <details> <p>
>>>     - id (primary key)<br>
>>>     - bug_id (foreign key referencing the Bugs table)<br>
>>>     - type (image, video)<br>
>>>     - file_name<br>
>>>     - file_path<br>
>>>     - created_at<br>
>>>     - updated_at<br>
>>>     </p>
>>>     </details>
>>>
>>> - [ ] &nbsp; &nbsp; *5.* Activity Log Table <details> <p>
>>>     - id (primary key)<br>
>>>     - user_id (foreign key referencing the Users table)<br>
>>>     - bug_id (foreign key referencing the Bugs table)<br>
>>>     - action (create, update, delete)<br>
>>>     - created_at<br>
>>>     </p>
>>>     </details>
>>










 # Product Description
> ## Product Perspective
> A good bug report should be concise yet informationally dense, and should only contain one bug. In addition, it should include details of the environment and user steps that would allow the developer to reproduce the bug on their own. Reproducing the bug is essential to debugging, as it ensures the developer is not stumbling in the dark. By providing this information, teams can ensure their bug reports are as effective as possible.
> ## Product Feature
> A user-friendly interface is essential for a successful bug tracker, and should include customizable fields for gathering pertinent information about the bug. 
> These fields can include text, drop-down lists, checkboxes and more, allowing users to easily input the bug environment, module, severity, and other important details. 
> By having these fields available, users can ensure their bug reports are as effective as possible and can be easily tracked and monitored.
> ### User Types
> Bug tracking is a collaborative process, and should involve multiple user types. 
> Normal users can log a bug, while the team decides which bugs should be in scope for the project, which should go into the main backlog, and which should be addressed during the next iteration, sprint, or cycle. 
> By involving multiple user types, teams can ensure that the bug tracking process is as efficient and effective as possible, leading to the highest quality of products.
> ### Contraints
> Required fields for the bug report. <br>
> Note that the required fields of the bug report are: <br> 
>  &nbsp;  &nbsp;  **Bug Summary**,  <br>
>  &nbsp;  &nbsp;  **Severity**,  <br>
>  &nbsp;  &nbsp;  **Steps to reproduce**,  <br>
>  &nbsp;  &nbsp;  **Actual Result**,<br>
>  &nbsp;  &nbsp;  **Expected Result**.<br>
>
> ## Assumptions
> It helps testers function better, easily report and fix bugs. <br>
> Testers can view and utilize all the information required to resolve issues, <br>
> which enables faster development, verification, and releases of updated versions or even, <br>
> feature fixes. Faster releases make happier customers.
> ## Risks
> Complications can arise out of confusion over descriptions, lack of information, tools that <br>
> are overly cumbersome and require mandatory fields for which the user doesn't have the answers, <br>
> and difficulty in reporting.

 # System Feature
> ## Function Requirements
>> [![PDF Diagram](img-vid/intro-Dia001.png)](img-vid/intro-Diagram.pdf)
>> [![PDF Account](img-vid/account-Dia002.png)](img-vid/account-Diagram.pdf)
>> [![PDF Account](img-vid/admin-Dia003.png)](img-vid/admin-Diagram.pdf)
>> [![PDF Account](img-vid/tester-Dia004.png)](img-vid/tester-Diagram.pdf)
>> [![PDF Account](img-vid/manager-Dia005.png)](img-vid/manager-Diagram.pdf)
>> ### NOTE: this will update regularly. 
> ## External Interface Requirements
>> ### User Interface
>>>
>> ### Software Interface
>>> use the visual studio
>> ### Hareware Interface
>>> basic computer with internet 
>> ### Comunication Interface
>>> apis 

> ## System Requirements
>> ### Operating System
>> ### Processor
>> ### Ram
>> ### Browser
>> ### Devices

> ## Non-Function Requirements
>> ### Performance
>> ### Security
>> ### Scalability
>> ### Compatibility

> ## Models
>> ### Process Models
>> ### Function Decomposition
>> ### Use Case
>> ### Data Flow Diagram
>> ### Sequence Diagram
>> ### Entity Relationship Diagram

> ## Appendices and Credits
>> SRS - https://www.youtube.com/watch?v=rhXfrscZ_tM <br> 
>> MVP - https://blackboxofpm.com/mvpm-minimum-viable-product-manager-e1aeb8dd421 <br> 
>>
