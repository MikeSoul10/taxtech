-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "concepto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "fecha" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL,
    "deducible" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReservaFiscal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cantidad" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
