import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { ProductService } from '../../services/productService';
import { BulkUploadResult } from '../../types/models/product';

interface UploadProgress {
  current: number;
  total: number;
  filename: string;
}

export default function BulkUploadScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/xml', 'text/csv', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        setSelectedFile(result.assets[0]);
        setUploadResult(null);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to upload products');
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: 1, filename: selectedFile.name });

    try {
      const fileContent = await fetch(selectedFile.uri).then(res => res.text());
      
      let result: BulkUploadResult;
      
      if (selectedFile.name.toLowerCase().endsWith('.xml')) {
        result = await ProductService.bulkUploadFromXML(fileContent, user.uid);
      } else if (selectedFile.name.toLowerCase().endsWith('.csv')) {
        result = await ProductService.bulkUploadFromCSV(fileContent, user.uid);
      } else {
        throw new Error('Unsupported file format');
      }

      setUploadResult(result);
      
      if (result.success) {
        Alert.alert(
          'Upload Complete',
          `Successfully added ${result.productsAdded} products. ${result.errors.length} errors found.`,
          [
            { text: 'OK' },
            { text: 'View Results', onPress: () => setShowTemplate(true) }
          ]
        );
      } else {
        Alert.alert('Upload Failed', 'Please check the errors and try again.');
      }
    } catch (error: any) {
      Alert.alert('Upload Error', error.message || 'Failed to upload products');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const downloadTemplate = () => {
    const template = ProductService.getBulkUploadTemplate();
    
    // Create CSV template
    const csvContent = [
      template.fields.join(','),
      Object.values(template.sampleData).join(','),
    ].join('\n');

    // Create downloadable file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderError = ({ item }: { item: any }) => (
    <View style={styles.errorItem}>
      <Text style={styles.errorRow}>Row {item.row}</Text>
      <Text style={styles.errorField}>Field: {item.field}</Text>
      <Text style={styles.errorMessage}>{item.message}</Text>
    </View>
  );

  const renderWarning = ({ item }: { item: any }) => (
    <View style={styles.warningItem}>
      <Text style={styles.warningMessage}>Row {item.row}: {item.message}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bulk Product Upload</Text>
        <Text style={styles.subtitle}>Upload multiple products using XML or CSV files</Text>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Use</Text>
          <View style={styles.instructions}>
            <Text style={styles.instructionItem}>1. Download our template file</Text>
            <Text style={styles.instructionItem}>2. Fill in your product data</Text>
            <Text style={styles.instructionItem}>3. Upload the completed file</Text>
            <Text style={styles.instructionItem}>4. Review and confirm upload</Text>
          </View>
        </View>

        {/* Template Download */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Download Template</Text>
          <View style={styles.templateButtons}>
            <TouchableOpacity
              style={styles.templateButton}
              onPress={downloadTemplate}
            >
              <Text style={styles.templateButtonText}>Download CSV Template</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => setShowTemplate(true)}
            >
              <Text style={styles.templateButtonText}>View XML Format</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* File Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select File</Text>
          
          {selectedFile ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedFile(null)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
              <Text style={styles.filePickerText}>Choose XML or CSV File</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, (!selectedFile || uploading) && styles.disabledButton]}
          onPress={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.uploadButtonText}>Uploading... {progress?.current}/{progress?.total}</Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>Upload Products</Text>
          )}
        </TouchableOpacity>

        {/* Results */}
        {uploadResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Upload Results</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{uploadResult.productsAdded}</Text>
                <Text style={styles.statLabel}>Added</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{uploadResult.productsUpdated}</Text>
                <Text style={styles.statLabel}>Updated</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{uploadResult.errors.length}</Text>
                <Text style={styles.statLabel}>Errors</Text>
              </View>
            </View>

            {uploadResult.errors.length > 0 && (
              <View style={styles.errorsSection}>
                <Text style={styles.errorsTitle}>Errors</Text>
                <FlatList
                  data={uploadResult.errors}
                  renderItem={renderError}
                  keyExtractor={(item, index) => `error-${index}`}
                  scrollEnabled={false}
                />
              </View>
            )}

            {uploadResult.warnings.length > 0 && (
              <View style={styles.warningsSection}>
                <Text style={styles.warningsTitle}>Warnings</Text>
                <FlatList
                  data={uploadResult.warnings}
                  renderItem={renderWarning}
                  keyExtractor={(item, index) => `warning-${index}`}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Template Modal */}
      <Modal
        visible={showTemplate}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTemplate(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>XML Template Format</Text>
            <ScrollView style={styles.templateScroll}>
              <Text style={styles.templateText}>{`<?xml version="1.0" encoding="UTF-8"?>
<products>
  <product>
    <title>Premium Wireless Headphones</title>
    <description>High-quality wireless headphones with noise cancellation</description>
    <price>299.99</price>
    <originalPrice>399.99</originalPrice>
    <category>Electronics</category>
    <subcategory>Audio</subcategory>
    <quantity>50</quantity>
    <sku>WH-001</sku>
    <weight>0.5</weight>
    <length>20</length>
    <width>15</width>
    <height>8</height>
    <shippingClass>standard</shippingClass>
    <images>
      <image>https://example.com/image1.jpg</image>
      <image>https://example.com/image2.jpg</image>
    </images>
    <tags>
      <tag>wireless</tag>
      <tag>headphones</tag>
      <tag>bluetooth</tag>
    </tags>
    <specifications>
      <brand>Samsung</brand>
      <color>Black</color>
      <model>Galaxy Buds Pro</model>
    </specifications>
  </product>
</products>
              `}</Text>
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTemplate(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  instructions: {
    marginBottom: 16,
  },
  instructionItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    paddingLeft: 16,
  },
  templateButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  templateButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  templateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filePicker: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  filePickerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  errorsSection: {
    marginTop: 16,
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  errorItem: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorRow: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#721c24',
  },
  errorField: {
    fontSize: 12,
    color: '#721c24',
    marginTop: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#721c24',
    marginTop: 4,
  },
  warningsSection: {
    marginTop: 16,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningItem: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 12,
    color: '#856404',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  templateScroll: {
    maxHeight: 400,
  },
  templateText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 16,
  },
  modalCloseButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});