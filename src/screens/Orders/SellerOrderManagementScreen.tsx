import {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {Order} from '../../types/models/order';
import {Ionicons} from '@expo/vector-icons';

interface OrderItemProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  onProcessRefund: (orderId: string, amount: number, reason: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({order, onUpdateStatus, onProcessRefund}) => {
  const [showActions, setShowActions] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState(order.total.toString());
  const [refundReason, setRefundReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'shipped':
        return '#2196F3';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'refund_requested':
        return '#FF9800';
      case 'refunded':
        return '#9E9E9E';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'payment_failed':
        return 'Payment Failed';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    Alert.alert(
      'Update Order Status',
      `Are you sure you want to change the status to ${getStatusText(newStatus)}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: () => onUpdateStatus(order.id, newStatus),
        },
      ]
    );
    setShowActions(false);
  };

  const handleRefund = () => {
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > order.total) {
      Alert.alert('Invalid Amount', 'Please enter a valid refund amount.');
      return;
    }
    
    if (!refundReason.trim()) {
      Alert.alert('Required', 'Please provide a refund reason.');
      return;
    }

    Alert.alert(
      'Process Refund',
      `Are you sure you want to refund RM${amount} for this order?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: () => {
            onProcessRefund(order.id, amount, refundReason);
            setShowRefundModal(false);
            setRefundAmount(order.total.toString());
            setRefundReason('');
          },
        },
      ]
    );
  };

  const availableActions = () => {
    switch (order.status) {
      case 'confirmed':
        return ['processing', 'shipped', 'cancelled'];
      case 'shipped':
        return ['delivered'];
      case 'delivered':
        return [];
      default:
        return [];
    }
  };

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={[styles.status, {color: getStatusColor(order.status)}]}>
            {getStatusText(order.status)}
          </Text>
        </View>
        <Text style={styles.orderAmount}>RM {order.total}</Text>
      </View>

      <View style={styles.orderDetails}>
        {order.items.map((item, index) => (
          <View key={index} style={styles.detailRow}>
            <Text style={styles.detailLabel}>Item {index + 1}:</Text>
            <Text style={styles.detailValue}>{item.title} (x{item.quantity})</Text>
          </View>
        ))}
        {order.transactionId && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue}>{order.transactionId}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(order.metadata.createdAt?.toMillis() || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {order.shippingAddress && (
        <View style={styles.shippingInfo}>
          <Text style={styles.sectionTitle}>Shipping Address:</Text>
          <Text style={styles.addressText}>{(order.shippingAddress as any).name}</Text>
          <Text style={styles.addressText}>{order.shippingAddress.addressLine1}</Text>
          {order.shippingAddress.addressLine2 && (
            <Text style={styles.addressText}>{order.shippingAddress.addressLine2}</Text>
          )}
          <Text style={styles.addressText}>
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </Text>
          <Text style={styles.addressText}>{order.shippingAddress.country}</Text>
          <Text style={styles.addressText}>{(order.shippingAddress as any).phoneNumber}</Text>
        </View>
      )}

      {order.refundRequest && (
        <View style={styles.refundInfo}>
          <Text style={styles.sectionTitle}>Refund Request:</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>RM {order.refundRequest?.amount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reason:</Text>
            <Text style={styles.detailValue}>{order.refundRequest?.reason}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        {order.refundRequest && order.refundRequest.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.refundButton]}
            onPress={() => setShowRefundModal(true)}>
            <Ionicons name="cash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Process Refund</Text>
          </TouchableOpacity>
        )}
        
        {availableActions().length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.updateButton]}
            onPress={() => setShowActions(true)}>
            <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Update Status</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Update Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActions(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            {availableActions().map((action) => (
              <TouchableOpacity
                key={action}
                style={styles.modalButton}
                onPress={() => handleStatusUpdate(action)}>
                <Text style={styles.modalButtonText}>{getStatusText(action)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowActions(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Refund Modal */}
      <Modal
        visible={showRefundModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRefundModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Process Refund</Text>
            
            <Text style={styles.inputLabel}>Refund Amount (RM):</Text>
            <TextInput
              style={styles.input}
              value={refundAmount}
              onChangeText={setRefundAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
            />
            
            <Text style={styles.inputLabel}>Refund Reason:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={refundReason}
              onChangeText={setRefundReason}
              placeholder="Enter reason for refund"
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRefundModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRefund}>
                <Text style={styles.modalButtonText}>Confirm Refund</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#FF385C',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF385C',
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  shippingInfo: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  refundInfo: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  refundButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
});