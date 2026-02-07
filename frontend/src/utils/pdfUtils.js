import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateBillPDF = (bill, storeData) => {
    try {
        console.log("Generating PDF for bill:", bill.billNumber);
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // Header - Pharmacy Name
        doc.setFontSize(22);
        doc.setTextColor(63, 81, 181); // Indigo color
        doc.setFont("helvetica", "bold");
        doc.text(storeData?.storeName || "MediStock Pharmacy", 20, 20);

        // Header - Pharmacy Details
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        let currentY = 28;

        doc.text(storeData?.storeAddress || "Official MediStock Partner", 20, currentY);
        currentY += 5;

        if (storeData?.phone) {
            doc.text(`Phone: ${storeData.phone}`, 20, currentY);
            currentY += 5;
        }

        if (storeData?.licenseNumber) {
            doc.text(`License: ${storeData.licenseNumber}`, 20, currentY);
            currentY += 5;
        }

        doc.text(`Bill No: ${bill.billNumber}`, 20, currentY);
        currentY += 5;
        doc.text(`Date: ${new Date(bill.date).toLocaleString('en-IN')}`, 20, currentY);

        // Customer Info
        doc.line(20, currentY + 5, pageWidth - 20, currentY + 5);
        currentY += 15;

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 20, currentY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        currentY += 7;
        doc.text(`Customer: ${bill.customerName || "Walking Customer"}`, 20, currentY);

        if (bill.customerPhone) {
            currentY += 6;
            doc.text(`Phone: ${bill.customerPhone}`, 20, currentY);
        }

        // Items Table
        const tableData = bill.items.map(item => [
            item.medicineName,
            item.quantity.toString(),
            `INR ${item.price.toFixed(2)}`,
            `INR ${item.total.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: currentY + 10,
            head: [['Medicine', 'Qty', 'Price', 'Total']],
            body: tableData,
            headStyles: { fillColor: [63, 81, 181] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 20, right: 20 }
        });

        // Totals
        const finalY = (doc).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Grand Total: INR ${bill.totalAmount.toFixed(2)}`, pageWidth - 80, finalY);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Payment Method: ${bill.paymentMethod.toUpperCase()}`, 20, finalY);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        const footerText = "Thank you for choosing MediStock. Visit again!";
        doc.text(footerText, (pageWidth - doc.getTextWidth(footerText)) / 2, doc.internal.pageSize.height - 10);

        // Save
        doc.save(`${bill.billNumber}.pdf`);
        console.log("PDF generation successful");
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Failed to generate PDF. Please check console for details.");
    }
};
