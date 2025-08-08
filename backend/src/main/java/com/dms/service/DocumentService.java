package com.dms.service;

import com.dms.entity.Document;
import com.dms.entity.User;
import com.dms.repository.mongo.DocumentRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Base64;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserService userService;

    @Value("${app.file.allowed-extensions}")
    private String allowedExtensions;

    @Value("${app.file.max-file-size}")
    private Long maxFileSize;

    private static final int THUMB_MAX_WIDTH = 480;
    private static final int THUMB_MAX_HEIGHT = 320;

    public Document uploadDocument(MultipartFile file, Long userId, String description, 
                                 List<String> tags, boolean isPublic, List<Long> allowedUsers) throws IOException {
        // Validate file
        validateFile(file);

        // Get user
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;

        // Convert file to base64
        byte[] fileBytes = file.getBytes();
        String base64Content = Base64.getEncoder().encodeToString(fileBytes);

        // Create document entity
        Document document = new Document(
                uniqueFilename,
                originalFilename,
                file.getContentType(),
                file.getSize(),
                uniqueFilename, // Use filename as filePath for reference
                base64Content,
                userId,
                user.getUsername()
        );

        // Generate and set thumbnail (best-effort)
        try {
            String thumbnailBase64 = generateThumbnail(fileBytes, file.getContentType(), originalFilename);
            document.setThumbnailContent(thumbnailBase64);
        } catch (Exception ex) {
            // Ignore thumbnail errors; proceed without breaking upload
            document.setThumbnailContent(null);
        }

        document.setDescription(description);
        document.setTags(tags);
        document.setPublic(isPublic);
        document.setAllowedUsers(allowedUsers);

        return documentRepository.save(document);
    }

    public Optional<Document> getDocumentById(String documentId) {
        return documentRepository.findByIdAndIsDeletedFalse(documentId);
    }

    public Optional<Document> getDocumentByIdForUser(String documentId, Long userId) {
        Optional<Document> documentOpt = getDocumentById(documentId);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();
            if (document.canAccess(userId)) {
                return documentOpt;
            }
        }
        return Optional.empty();
    }

    public Page<Document> getUserDocuments(Long userId, Pageable pageable) {
        return documentRepository.findUserDocuments(userId, pageable);
    }

    public Page<Document> getPublicDocuments(Pageable pageable) {
        return documentRepository.findPublicDocuments(pageable);
    }

    public Page<Document> getAccessibleDocuments(Long userId, Pageable pageable) {
        return documentRepository.findAccessibleDocuments(userId, pageable);
    }

    public List<Document> searchDocuments(String searchTerm) {
        return documentRepository.searchDocuments(searchTerm);
    }

    public Page<Document> searchDocuments(String searchTerm, Pageable pageable) {
        return documentRepository.searchDocuments(searchTerm, pageable);
    }

    public Document updateDocument(String documentId, String description, List<String> tags, 
                                 boolean isPublic, List<Long> allowedUsers, Long userId) {
        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Check if user can modify the document
        if (!document.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only modify your own documents");
        }

        document.setDescription(description);
        document.setTags(tags);
        document.setPublic(isPublic);
        document.setAllowedUsers(allowedUsers);
        document.updateLastModified();

        return documentRepository.save(document);
    }

    public void deleteDocument(String documentId, Long userId) {
        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Check if user can delete the document
        if (!document.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only delete your own documents");
        }

        document.setDeleted(true);
        documentRepository.save(document);
    }

    public void incrementDownloadCount(String documentId) {
        Optional<Document> documentOpt = getDocumentById(documentId);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();
            document.incrementDownloadCount();
            documentRepository.save(document);
        }
    }

    public List<Document> getDocumentsByContentType(String contentType) {
        return documentRepository.findByContentType(contentType);
    }

    public List<Document> getDocumentsByTags(List<String> tags) {
        return documentRepository.findByTagsIn(tags);
    }

    public List<Document> getDocumentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return documentRepository.findByUploadDateBetween(startDate, endDate);
    }

    public long getUserDocumentCount(Long userId) {
        return documentRepository.countByUploadedByAndIsDeletedFalse(userId);
    }

    public long getPublicDocumentCount() {
        return documentRepository.countByIsPublicTrueAndIsDeletedFalse();
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("Invalid filename");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        if (!allowedExtensions.contains(fileExtension)) {
            throw new RuntimeException("File type not allowed. Allowed types: " + allowedExtensions);
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    private String generateThumbnail(byte[] fileBytes, String contentType, String originalFilename) throws Exception {
        if (contentType == null) return null;
        if (contentType.startsWith("image/")) {
            return generateImageThumbnail(fileBytes);
        }
        if (contentType.equals("application/pdf")) {
            return generatePdfThumbnail(fileBytes);
        }
        if (contentType.startsWith("video/")) {
            return generateVideoThumbnail(fileBytes, originalFilename);
        }
        // Basic support for common Office docs via LibreOffice -> PDF -> PNG
        if (contentType.contains("officedocument") || contentType.contains("msword") || contentType.contains("ms-excel") || contentType.contains("ms-powerpoint") || contentType.contains("vnd.openxmlformats")) {
            return generateOfficeThumbnailViaLibreOffice(fileBytes, originalFilename);
        }
        return null;
    }

    private String generateImageThumbnail(byte[] bytes) throws IOException {
        try (InputStream in = new ByteArrayInputStream(bytes)) {
            BufferedImage original = ImageIO.read(in);
            if (original == null) return null;
            BufferedImage scaled = scaleImage(original, THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(scaled, "png", out);
            return Base64.getEncoder().encodeToString(out.toByteArray());
        }
    }

    private String generatePdfThumbnail(byte[] bytes) throws IOException {
        try (InputStream in = new ByteArrayInputStream(bytes); PDDocument doc = PDDocument.load(in)) {
            PDFRenderer renderer = new PDFRenderer(doc);
            BufferedImage pageImage = renderer.renderImageWithDPI(0, 220); // first page at higher DPI
            BufferedImage scaled = scaleImage(pageImage, THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(scaled, "png", out);
            return Base64.getEncoder().encodeToString(out.toByteArray());
        }
    }

    private String generateVideoThumbnail(byte[] bytes, String originalFilename) throws IOException, InterruptedException {
        Path tempDir = Files.createTempDirectory("thumb-video-");
        Path input = tempDir.resolve(originalFilename);
        Path output = tempDir.resolve("thumb.png");
        Files.write(input, bytes);
        ProcessBuilder pb = new ProcessBuilder("ffmpeg", "-y", "-i", input.toString(), "-ss", "00:00:01", "-vframes", "1", "-vf", "scale=480:-1", output.toString());
        pb.redirectErrorStream(true);
        Process p = pb.start();
        p.waitFor();
        if (Files.exists(output)) {
            byte[] outBytes = Files.readAllBytes(output);
            try { Files.deleteIfExists(input); Files.deleteIfExists(output); Files.deleteIfExists(tempDir); } catch (Exception ignored) {}
            return Base64.getEncoder().encodeToString(outBytes);
        }
        try { Files.deleteIfExists(input); Files.deleteIfExists(output); Files.deleteIfExists(tempDir); } catch (Exception ignored) {}
        return null;
    }

    private String generateOfficeThumbnailViaLibreOffice(byte[] bytes, String originalFilename) throws IOException, InterruptedException {
        String safeName = originalFilename != null ? originalFilename : (UUID.randomUUID() + ".bin");
        Path tempDir = Files.createTempDirectory("thumb-office-");
        Path input = tempDir.resolve(safeName);
        Files.write(input, bytes);
        // Convert to PDF
        ProcessBuilder pb = new ProcessBuilder("libreoffice", "--headless", "--convert-to", "pdf", "--outdir", tempDir.toString(), input.toString());
        pb.redirectErrorStream(true);
        Process p = pb.start();
        p.waitFor();
        // Find produced PDF
        Path pdf = tempDir.resolve(replaceExt(safeName, "pdf"));
        String result = null;
        if (Files.exists(pdf)) {
            byte[] pdfBytes = Files.readAllBytes(pdf);
            result = generatePdfThumbnail(pdfBytes);
        }
        try { Files.walk(tempDir).sorted((a,b)->b.getNameCount()-a.getNameCount()).forEach(path -> { try { Files.deleteIfExists(path); } catch (Exception ignored) {} }); } catch (Exception ignored) {}
        return result;
    }

    private static String replaceExt(String name, String newExt) {
        int i = name.lastIndexOf('.');
        if (i >= 0) return name.substring(0, i + 1) + newExt;
        return name + "." + newExt;
    }

    private BufferedImage scaleImage(BufferedImage src, int maxW, int maxH) {
        int w = src.getWidth();
        int h = src.getHeight();
        double ratio = Math.min(1.0, Math.min((double) maxW / w, (double) maxH / h));
        int newW = Math.max(1, (int) Math.round(w * ratio));
        int newH = Math.max(1, (int) Math.round(h * ratio));
        BufferedImage img = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(src, 0, 0, newW, newH, null);
        g.dispose();
        return img;
    }
} 