-- CreateTable
CREATE TABLE "luggo_products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 1,
    "priceCents" INTEGER NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "badge" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "luggo_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,
    "sort" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "luggo_product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_shipping_zones" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countries" TEXT NOT NULL DEFAULT '',
    "rateCents" INTEGER NOT NULL,
    "freeFromCents" INTEGER,
    "transit" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "luggo_shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNo" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zoneKey" TEXT NOT NULL,
    "zoneName" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT '',
    "subtotalCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL,
    "vatCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "pspPaymentId" TEXT,
    "stripeSessionId" TEXT,
    "carrier" TEXT NOT NULL DEFAULT '',
    "trackingCode" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "stockDeducted" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "luggo_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,

    CONSTRAINT "luggo_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_order_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "luggo_order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_faq_items" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "luggo_faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kicker" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL DEFAULT '',
    "updatedOn" TEXT NOT NULL DEFAULT '',
    "sections" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "luggo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "luggo_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "luggo_settings" (
    "key" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "luggo_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "luggo_counters" (
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "luggo_counters_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "luggo_products_slug_key" ON "luggo_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "luggo_shipping_zones_key_key" ON "luggo_shipping_zones"("key");

-- CreateIndex
CREATE UNIQUE INDEX "luggo_orders_number_key" ON "luggo_orders"("number");

-- CreateIndex
CREATE UNIQUE INDEX "luggo_orders_pspPaymentId_key" ON "luggo_orders"("pspPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "luggo_orders_stripeSessionId_key" ON "luggo_orders"("stripeSessionId");

-- CreateIndex
CREATE INDEX "luggo_orders_status_createdAt_idx" ON "luggo_orders"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "luggo_pages_slug_key" ON "luggo_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "luggo_subscribers_email_key" ON "luggo_subscribers"("email");

-- AddForeignKey
ALTER TABLE "luggo_product_images" ADD CONSTRAINT "luggo_product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "luggo_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luggo_order_items" ADD CONSTRAINT "luggo_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "luggo_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luggo_order_items" ADD CONSTRAINT "luggo_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "luggo_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "luggo_order_events" ADD CONSTRAINT "luggo_order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "luggo_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
