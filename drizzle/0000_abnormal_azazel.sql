CREATE TABLE "daily_revenue" (
	"date" varchar(10) PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"order_count" numeric DEFAULT '0',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT 'f4xis09undb5qj9tzksv7ptx' NOT NULL,
	"category" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"image_url" varchar(500),
	"image_public_id" varchar(255),
	"price" numeric(10, 2) DEFAULT '0.00',
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"email" varchar(255) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"address" text,
	"pickup" boolean DEFAULT false,
	"items" jsonb NOT NULL,
	"special_instructions" text,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) DEFAULT 'pay-on-delivery',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT 'gbtzkqlcy9jn2qwfd0ut7fjv' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;