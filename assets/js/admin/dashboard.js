// Joy Guru - Admin Dashboard Module
(function () {
  window.AdminDashboard = {
    init: function () {
      this.updateStats();
      this.initChart();
    },

    updateStats: function () {
      const bookings = StateEngine.getBookings() || [];
      
      // Calculate metrics
      const totalBookingsCount = bookings.length;
      
      // Today's Date format YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysBookings = bookings.filter(b => b.travelDate === todayStr).length;
      
      const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
      
      // Confirmed bookings (including Advance Paid, Driver Assigned, Trip Started)
      const confirmedBookings = bookings.filter(b => 
        b.status === 'Confirmed' || 
        b.status === 'Advance Paid' || 
        b.status === 'Driver Assigned' || 
        b.status === 'Trip Started'
      ).length;

      const completedTrips = bookings.filter(b => b.status === 'Completed' || b.status === 'Fully Paid').length;
      const cancelledTrips = bookings.filter(b => b.status === 'Cancelled').length;

      // Revenue = sum of payable amount for Confirmed/Advance Paid/Completed trips
      const totalRevenue = bookings
        .filter(b => b.status !== 'Cancelled' && b.status !== 'Pending')
        .reduce((sum, b) => sum + (b.payableAmount || 0), 0);

      // Pending payments = sum of balanceDue
      const pendingPayments = bookings
        .filter(b => b.status !== 'Cancelled' && b.status !== 'Completed' && b.status !== 'Fully Paid')
        .reduce((sum, b) => sum + (b.balanceDue || 0), 0);

      // Update UI cards
      // The cards are:
      // Card 1: Revenue
      // Card 2: Active Bookings (confirmedBookings)
      // Card 3: Pending Collection (pendingPayments)
      // Card 4: Customer Rating (4.92 / 5.0)

      const cardsContainer = document.querySelector('section.lg\\:col-span-9 > div.grid');
      if (cardsContainer) {
        const cards = cardsContainer.children;
        if (cards.length >= 4) {
          // Card 1: Revenue
          cards[0].querySelector('span.block').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
          cards[0].querySelector('span.text-[10px]').innerHTML = `<iconify-icon icon="lucide:arrow-right" class="-rotate-45"></iconify-icon> Completed: ${completedTrips} Trips`;
          
          // Card 2: Active Bookings
          cards[1].querySelector('span.block').textContent = `${confirmedBookings} Rides`;
          cards[1].querySelector('span.text-[10px]').innerHTML = `<iconify-icon icon="lucide:arrow-right" class="-rotate-45"></iconify-icon> Total: ${totalBookingsCount} Bookings`;

          // Card 3: Pending Collection
          cards[2].querySelector('span.block').textContent = `₹${pendingPayments.toLocaleString('en-IN')}`;
          cards[2].querySelector('span.text-[10px]').textContent = `Pending: ${pendingBookings} Bookings`;

          // Card 4: Stats details
          cards[3].querySelector('span.block').textContent = `4.92 / 5.0`;
          cards[3].querySelector('span.text-[10px]').textContent = `Based on ${1420 + completedTrips} reviews`;
        }
      }
    },

    initChart: function () {
      const ctx = document.getElementById('adminTrendChart');
      if (!ctx) return;

      // Find if chart instance already exists
      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }

      const bookings = StateEngine.getBookings() || [];
      
      // Group bookings by Month
      const monthNames = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      const monthlyBookingsData = [120, 180, 240, 290, 380, 450]; // Defaults
      const monthlyCompletedData = [40, 65, 80, 95, 140, 180]; // Defaults

      // Incorporate actual database counts into October (Proj) if present
      const octBookings = bookings.length;
      const octCompleted = bookings.filter(b => b.status === 'Completed' || b.status === 'Fully Paid').length;
      
      monthlyBookingsData[5] = 400 + octBookings;
      monthlyCompletedData[5] = 150 + octCompleted;

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: monthNames,
          datasets: [
            {
              label: 'Monthly Bookings',
              data: monthlyBookingsData,
              borderColor: '#0F4C81',
              backgroundColor: 'rgba(15, 76, 129, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true
            },
            {
              label: 'Tours Completed',
              data: monthlyCompletedData,
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { family: 'Poppins, sans-serif', size: 11 } }
            }
          },
          scales: {
            y: { grid: { color: '#E2E8F0' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
  };

  // Run on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    window.AdminDashboard.init();
  });
})();
