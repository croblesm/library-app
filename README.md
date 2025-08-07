# Library App

**End-to-end demo finished, including:**

- Terraform provisioning for SQL database in Microsoft Fabric (with local SQL Server 2025 container option)
- Code-first schema creation (Sequelize)
- Code-first schema seed (Sequelize seeders)
- Node.js backend (Express)
- Microsoft Entra ID authentication
- React frontend
- Developed and managed in VS Code
- Uses the MSSQL extension for database management
- GitHub Copilot integration with the MSSQL extension for AI-powered SQL authoring and productivity

> [!IMPORTANT]
> Prerequisite: This demo assumes you have all required CLI tools installed, including [Terraform](https://developer.hashicorp.com/terraform/downloads), [Node.js & npm](https://nodejs.org/), and the Azure CLI (for authentication). Ensure these are available in your environment before proceeding.

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd library-app
```

## 2. Infrastructure Setup (Terraform)

To provision the Microsoft Fabric SQL database and workspace, run these commands in the `infrastructure` directory:

```bash
cd infrastructure
terraform init
terraform plan -out main.tfplan
terraform apply main.tfplan
```

> [!NOTE]
> You must provide the correct Fabric capacity name in your `terraform.tfvars` file. To get the capacity name: go to your Fabric workspace settings, then click **License info**.

---

## How to Run the App from Scratch

Follow these steps to set up and run the app:

### 1. Install Backend and Frontend Dependencies

#### Install Backend Dependencies

Navigate to the backend directory and install the required packages:

```bash
cd app/backend
npm install
```

#### Install Frontend Dependencies

Navigate to the frontend directory and install the required packages:

```bash
cd app/frontend/library-frontend
npm install
```

### 2. Configure the Environment

#### For Microsoft Fabric SQL Database

Create a `.env` file in the `backend/config` directory with the following content, replacing the placeholders with your Fabric SQL Database connection string:

```plaintext
DB_CONNECTION_STRING=mssql://<your-fabric-server>.database.fabric.microsoft.com:1433/<your-db>?encrypt=true&trustServerCertificate=false
```

#### For Local SQL Server 2025 (running in Docker)

If you want to use a local SQL Server, use the following variables instead:

```plaintext
DB_SERVER=<your-database-server,your-database-port>
DB_USER=<your-database-username>
DB_PASSWORD=<your-database-password>
DB_DATABASE=<your-database-name>
```

### 3. Database Setup

#### Create Empty Database

- **For Local SQL Server:**

You can create the empty database using:

```bash
cd app/backend
npx sequelize-cli db:create
```

- **For Microsoft Fabric SQL Database:**

You must create using an IaC script like Terraform or Bicep, or create the database manually in the Azure/Fabric portal or with your preferred SQL tool. The `sequelize-cli db:create` command does not work for Fabric SQL DBs.

> [!NOTE]
> The database schema (tables) will be automatically created when you start the application, as Sequelize will synchronize the models with the database.

### 4. Start the App

#### Start Backend Server

```bash
cd app/backend
npm start
```

#### Start Frontend Application

```bash
cd app/frontend/library-frontend
npm start
```

### 5. Seed Test Data

You can use the Sequelize CLI to seed the database for both Microsoft Fabric SQL Database and Local SQL Server:

```bash
cd app/backend
npx sequelize-cli db:seed:all
```

> [!NOTE]
> This will populate the database with sample books, authors, and other test data for demonstration purposes. It will also create the `GetBooksWithAuthors` stored procedure automatically.

### 6. Access the App

Open your browser and navigate to the following URLs to access the app:

- **Backend**: [http://localhost:3000](http://localhost:3000)
- **Frontend**: [http://localhost:3001](http://localhost:3001)

### 7. Clean Up (When Finished)

#### Drop Database (Local SQL Server Only)

To drop the database when using a local SQL Server, run:

```bash
cd app/backend
npx sequelize-cli db:drop
```

> [!NOTE]
> This command does not work for Microsoft Fabric SQL Database. For Fabric, drop the database manually via the Azure/Fabric portal or your preferred SQL tool.

#### Drop All Tables (Any Database)

If you want to drop all tables (but not the database itself), you can use the provided script:

```bash
cd app/backend
node ./scripts/dropAllTables.js
```

> [!NOTE]
> This will execute the `20250514040000-drop-tables.sql` script and drop all tables in your database using Sequelize. Make sure your `.env` is configured for the correct database connection.

---

### (Optional) Destroy All Provisioned Infrastructure

If you want to remove all resources created by Terraform (including the Fabric SQL database and workspace), run:

```bash
cd infrastructure
terraform destroy
```

> [!IMPORTANT]
> This will permanently delete all provisioned resources. Use with caution!
